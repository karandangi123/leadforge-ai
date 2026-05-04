"use client";

import React, { useState } from "react";
import { ShieldCheck, Copy, CheckCircle2, AlertCircle, X } from "lucide-react";
import { startMfaSetup, completeMfaSetup } from "@/app/actions/mfa";
import { toast } from "sonner";

export function MFASetupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"QR" | "VERIFY" | "SUCCESS">("QR");
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startMfaSetup();
      setSetupData(data);
    } catch (err) {
      toast.error("Failed to initiate MFA setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!setupData || token.length !== 6) return;
    setLoading(true);
    try {
      const result = await completeMfaSetup(setupData.secret, token);
      if (result.success) {
        setBackupCodes(result.backupCodes || []);
        setStep("SUCCESS");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleStart();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040a]/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-[#d9d2c1] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#f3faf7] border border-[#cfe7de] flex items-center justify-center text-[#176b5d]">
              <ShieldCheck size={24} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#f7f5ef] rounded-full transition-colors">
              <X size={20} className="text-[#687169]" />
            </button>
          </div>

          {step === "QR" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1e2521] tracking-tight">Protect your account</h3>
                <p className="text-sm text-[#687169] mt-2 leading-relaxed">
                  Scan this QR code with Google Authenticator or any TOTP app to enable two-factor authentication.
                </p>
              </div>

              {setupData ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="p-4 bg-white border-2 border-[#176b5d]/10 rounded-3xl shadow-inner">
                    <img src={setupData.qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a39b8b] mb-1">Manual Entry Code</p>
                    <code className="text-xs font-mono font-bold text-[#176b5d] bg-[#f3faf7] px-3 py-1 rounded-lg">
                      {setupData.secret}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#176b5d]" />
                </div>
              )}

              <button 
                onClick={() => setStep("VERIFY")}
                disabled={!setupData}
                className="w-full h-14 bg-[#176b5d] text-white font-black rounded-2xl shadow-lg hover:bg-[#115247] transition-all disabled:opacity-50"
              >
                I've scanned the code
              </button>
            </div>
          )}

          {step === "VERIFY" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1e2521] tracking-tight">Verify connection</h3>
                <p className="text-sm text-[#687169] mt-2 leading-relaxed">
                  Enter the 6-digit code from your authenticator app to confirm the setup.
                </p>
              </div>

              <div className="flex justify-center">
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  className="w-48 h-16 text-center text-3xl font-black tracking-[0.5em] border-2 border-[#d9d2c1] rounded-2xl outline-none focus:border-[#176b5d] transition-all placeholder:text-[#d9d2c1]"
                />
              </div>

              <button 
                onClick={handleVerify}
                disabled={token.length !== 6 || loading}
                className="w-full h-14 bg-[#176b5d] text-white font-black rounded-2xl shadow-lg hover:bg-[#115247] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : "Verify & Enable"}
              </button>
            </div>
          )}

          {step === "SUCCESS" && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#f3faf7] border border-[#cfe7de] flex items-center justify-center text-[#176b5d] mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#1e2521] tracking-tight">Security Hardened</h3>
                <p className="text-sm text-[#687169] mt-2 leading-relaxed">
                  Google Authenticator is now active. Save these backup codes in a safe place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#fcfbf9] border border-[#d9d2c1] rounded-2xl p-4 font-mono text-xs font-bold text-[#1e2521]">
                {backupCodes.map(code => <div key={code}>{code}</div>)}
              </div>

              <button 
                onClick={onClose}
                className="w-full h-14 bg-[#1e2521] text-white font-black rounded-2xl shadow-lg hover:bg-black transition-all"
              >
                Close & Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
