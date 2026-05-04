"use client";

import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { verifyMfaToken } from "@/lib/mfa"; // Wait, this is client side? No, I need a server action.
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// I'll create a server action for this
import { verifyMfaLogin } from "@/app/actions/mfa-login";

export default function VerifyMfaPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) return;
    
    setLoading(true);
    try {
      const result = await verifyMfaLogin(token);
      if (result.success) {
        router.push("/dashboard");
      } else {
        toast.error("Invalid verification code.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e2521] text-white mb-6 shadow-2xl shadow-black/10">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1e2521] mb-3">Two-Step Verification</h1>
          <p className="text-[#687169] text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            Your account is protected with Google Authenticator. Enter your 6-digit code to continue.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#d2cab7] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <input 
                type="text"
                maxLength={6}
                placeholder="000000"
                autoFocus
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                className="w-48 h-16 text-center text-3xl font-black tracking-[0.5em] border-2 border-[#d9d2c1] rounded-2xl outline-none focus:border-[#176b5d] transition-all placeholder:text-[#d9d2c1]"
              />
            </div>

            <button 
              type="submit"
              disabled={token.length !== 6 || loading}
              className="w-full h-14 bg-[#1e2521] text-white font-black rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-[#687169]">
          Lost access to your authenticator app? <a href="#" className="font-bold text-[#1e2521] hover:underline">Use a backup code</a>
        </p>
      </div>
    </main>
  );
}
