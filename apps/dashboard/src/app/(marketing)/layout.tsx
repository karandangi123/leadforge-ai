import { Inter, Outfit } from "next/font/google";
import { Navbar } from "@/components/marketing/ui/Navbar";
import { Footer } from "@/components/marketing/ui/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${outfit.variable} font-inter bg-[#02040a] text-[#F8FAFC] min-h-screen flex flex-col selection:bg-[#22D3EE]/30 relative isolate`}>
      {/* Cinematic Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
