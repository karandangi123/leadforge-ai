import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "LeadForge AI | Autonomous RevOps Architect",
  description: "Enterprise-grade AI agent for lead research, website audits, and human-in-the-loop outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased bg-[#fdfdfc]`}>
        <div className="flex flex-col lg:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50/50 pb-20 lg:pb-0 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
