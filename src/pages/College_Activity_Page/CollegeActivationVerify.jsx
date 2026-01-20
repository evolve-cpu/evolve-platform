import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function CollegeActivationVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const college = searchParams.get("college") || "";

  const { setUser, setAuthLoading } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");

    if (!email) return setError("Email missing. Please go back.");
    if (!otp.trim()) return setError("Please enter the OTP.");

    try {
      setLoading(true);

      // ✅ Verify OTP → real auth user is created/logged in
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "email"
      });

      if (error) throw error;

      const authUser = data?.user;
      if (!authUser) throw new Error("Auth user not found after verification.");

      // ✅ Create / Update profile (navbar name)
      await supabase.from("profiles").upsert(
        {
          id: authUser.id,
          username: name || authUser.user_metadata?.name || "evolve_user",
          avatar_url:
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser.id}`,
          is_guest: false
        },
        { onConflict: "id" }
      );

      // ✅ Find existing activation OR create new (so returning users reuse same data)
      const { data: existing, error: existingErr } = await supabase
        .from("college_activations")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (existingErr) throw existingErr;

      let activationId = existing?.id;

      if (!activationId) {
        const { data: created, error: createErr } = await supabase
          .from("college_activations")
          .insert([
            {
              user_id: authUser.id,
              name: name,
              email: email.toLowerCase(),
              college: college
            }
          ])
          .select("id")
          .single();

        if (createErr) throw createErr;
        activationId = created.id;
      }

      // ✅ Update auth UI instantly (navbar)
      setAuthLoading(true);
      setUser({
        id: authUser.id,
        email: authUser.email,
        username: name,
        avatar_url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser.id}`,
        is_guest: false
      });
      setAuthLoading(false);

      // ✅ Go next
      navigate(`/evolve-in-person/activities?id=${activationId}`);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-evolve-yellow flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] border-2 border-evolve-pink rounded-2xl p-6 bg-evolve-yellow">
        <h1 className="text-evolve-pink font-extrabold text-[32px] mb-3">
          verify email
        </h1>

        <p className="text-black text-[16px] mb-6">
          we sent an otp to <span className="font-bold">{email}</span>
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="enter otp"
          className="w-full rounded-[14px] border-[3px] border-black/50 bg-transparent px-5 py-3 text-black placeholder-black outline-none"
        />

        {error && (
          <p className="text-evolve-pink font-semibold mt-4">{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 w-full bg-black text-white font-extrabold rounded-[37.11px] py-3 shadow-[6px_6px_0px_rgba(0,0,0,0.25)] disabled:opacity-50"
        >
          {loading ? "verifying..." : "continue"}
        </button>
      </div>
    </div>
  );
}
