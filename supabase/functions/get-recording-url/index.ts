import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401, headers: CORS });

  // Service-role client — can read all columns, bypasses RLS
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify the calling user is actually authenticated
  const { data: { user } } = await admin.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (!user) return new Response("Unauthorized", { status: 401, headers: CORS });

  const { session_id } = await req.json();
  if (!session_id) return new Response("Missing session_id", { status: 400, headers: CORS });

  // Fetch recording_path — this column is hidden from client-side RLS
  const { data: session } = await admin
    .from("mentorship_sessions")
    .select("recording_path")
    .eq("id", session_id)
    .maybeSingle();

  if (!session?.recording_path) {
    return new Response(
      JSON.stringify({ url: null }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const path = session.recording_path;

  // If it's an external URL, detect whether it's a platform embed or a direct video file.
  if (path.startsWith("http")) {
    const isEmbed =
      path.includes("youtube.com/embed") ||
      path.includes("player.vimeo.com") ||
      path.includes("loom.com/embed") ||
      path.includes("iframe.mediadelivery.net");
    return new Response(
      JSON.stringify({ url: path, type: isEmbed ? "embed" : "video" }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  // Otherwise treat as a Supabase Storage path in the private
  // "session-recordings" bucket → generate a 2-hour signed URL.
  const { data, error } = await admin.storage
    .from("session-recordings")
    .createSignedUrl(path, 7200);

  if (error || !data?.signedUrl) {
    return new Response(
      JSON.stringify({ error: error?.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ url: data.signedUrl, type: "video" }),
    { headers: { ...CORS, "Content-Type": "application/json" } }
  );
});
