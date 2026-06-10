import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const evolvePin = import.meta.env.VITE_ADMIN_PIN;
  const anantPin  = import.meta.env.VITE_ANANT_ADMIN_PIN;

  const canSubmit = useMemo(() => pin.trim().length === 4, [pin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const entered = pin.trim();

    if (evolvePin && entered === String(evolvePin)) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_tenant", "evolve");
      navigate("/admin/dashboard");
      return;
    }

    if (anantPin && entered === String(anantPin)) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_tenant", "anant");
      navigate("/admin/dashboard");
      return;
    }

    setError("Wrong PIN. Try again.");
  };

  return (
    <div className="min-h-screen bg-evolve-yellow flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-[420px]
          bg-evolve-yellow
          border-2 border-black
          rounded-3xl
          p-8
          shadow-[10px_10px_0px_rgba(0,0,0,0.25)]
        "
      >
        <h1 className="text-black font-extrabold text-[32px] tracking-[-0.04em]">
          admin access
        </h1>

        <p className="mt-2 text-black/80 text-[16px]">
          enter the 4 digit pin to continue
        </p>

        <input
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(val);
          }}
          inputMode="numeric"
          placeholder="••••"
          className="
            mt-6 w-full
            rounded-2xl
            border-[3px] border-black/40
            bg-black/10
            px-6 py-4
            text-black font-extrabold
            text-[22px]
            tracking-[0.2em]
            outline-none
            text-center
          "
        />

        {error && <p className="mt-4 text-evolve-pink font-bold">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="
            mt-8 w-full
            bg-black text-white font-extrabold
            rounded-[37.11px]
            px-10 py-4
            text-[18px]
            shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
            transition-all duration-300
            active:scale-[0.98]
            disabled:opacity-40
          "
        >
          continue
        </button>
      </form>
    </div>
  );
}
