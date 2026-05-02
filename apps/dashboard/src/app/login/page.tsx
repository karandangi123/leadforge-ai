import { GoogleIcon } from "@/components/icons";
import { Sparkles } from "lucide-react";
import { signInWithGoogle, signInDemo } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authError = params.error ? "Authentication could not be completed. Try Google sign-in again." : null;

  return (
    <main className="min-h-screen bg-[#f7f5ef] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e2521] text-white mb-6 shadow-2xl shadow-black/10">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1e2521] mb-3">LeadForge AI</h1>
          <p className="text-[#687169] text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            One Google sign-in activates your workspace and Gmail draft bridge in the same flow.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#d2cab7] p-8 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#1e2521]">Welcome back</h2>
              <p className="text-sm text-[#687169]">Continue with Google to sign in, provision your workspace, and auto-connect Gmail for the person who logs in.</p>
            </div>

            {authError ? (
              <p className="rounded-xl border border-[#f0d4cd] bg-[#fff4eb] px-4 py-3 text-sm font-medium text-[#8e3c2d]">
                {authError}
              </p>
            ) : null}

            <form action={signInWithGoogle}>
              <button className="w-full h-14 rounded-xl bg-[#1e2521] text-sm font-black text-white transition-all hover:bg-black shadow-lg shadow-black/10 flex items-center justify-center gap-3">
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>
            </form>

            <div className="rounded-2xl border border-[#e3dccd] bg-[#fffdf8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#176b5d]">Gmail trust layer</p>
              <div className="mt-3 space-y-2 text-sm text-[#4f5a53]">
                <p>Each signed-in user connects their own Google account. LeadForge does not attach one shared Gmail to every operator.</p>
                <p>Only lightweight workspace data is synced in this phase: Gmail labels, recent draft metadata, and approved draft handoff.</p>
                <p>LeadForge does not auto-send email, and it does not import inbox message bodies in this implementation.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e3dccd]"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-[#687169]">
                <span className="bg-white px-4">Or use trial mode</span>
              </div>
            </div>

            <div className="space-y-3">
              <form action={signInDemo}>
                <button className="w-full h-14 rounded-xl border border-[#d9d2c1] bg-white text-sm font-black text-[#1e2521] transition-all hover:bg-[#f7f5ef] hover:border-[#1e2521]">
                  Enter Demo Workspace
                </button>
              </form>
            </div>


          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-[#687169] hover:text-[#1e2521] transition-colors">Documentation</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-[#687169] hover:text-[#176b5d] transition-colors">Privacy Policy</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-[#687169] hover:text-[#1e2521] transition-colors">Terms of Service</a>
        </div>
      </div>
    </main>
  );
}
