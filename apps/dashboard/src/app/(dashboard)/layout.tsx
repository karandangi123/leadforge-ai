import { Suspense } from "react";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#02040a]">
      <TopNav />
      <main className="flex-1 bg-[#02040a] min-w-0 h-full overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
