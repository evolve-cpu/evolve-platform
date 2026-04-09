import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to_email, to_name, report_url, template_id, remarks } = await req.json();

    if (!to_email || !template_id) {
      return new Response(
        JSON.stringify({ error: "to_email and template_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract first name for template param
    const firstName = (to_name || "").split(" ")[0] || to_name || "there";

    // Build Brevo payload — attach PDF only if report_url is provided
    const brevoPayload: Record<string, unknown> = {
      templateId: Number(template_id),
      to: [{ email: to_email, name: to_name || "" }],
      params: { FIRSTNAME: firstName, REPORT_URL: report_url || "", REMARKS: remarks || "" },
    };

    if (report_url) {
      // Fetch the PDF from Supabase Storage public URL
      const pdfRes = await fetch(report_url);
      if (!pdfRes.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch PDF from storage" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const pdfBuffer = await pdfRes.arrayBuffer();
      const uint8 = new Uint8Array(pdfBuffer);
      let binary = "";
      const chunk = 8192;
      for (let i = 0; i < uint8.length; i += chunk) {
        binary += String.fromCharCode(...uint8.subarray(i, i + chunk));
      }
      brevoPayload.attachment = [{ name: "portfolio-review-report.pdf", content: btoa(binary) }];
    }

    // Call Brevo transactional email API
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
    });

    const brevoData = await brevoRes.json();

    if (!brevoRes.ok) {
      return new Response(
        JSON.stringify({ error: "Brevo error", details: brevoData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: brevoData.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
