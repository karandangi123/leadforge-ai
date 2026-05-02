import { Suspense } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { BillingService } from "@leadforge/billing";
import { getActiveWorkspace } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getActiveWorkspace();
  const isPro = await BillingService.hasEntitlement(workspace.id, "PRO_FEATURES");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#02040a]">
      <TopNav isPro={isPro} />
      <main className="flex-1 bg-[#02040a] min-w-0 h-full overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
