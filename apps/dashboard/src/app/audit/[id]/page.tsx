import { getPublicAudit } from "@/app/actions/audit";
import { LeadPortal } from "@/components/outreach/lead-portal";
import { notFound } from "next/navigation";

export default async function PublicAuditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const auditData = await getPublicAudit(id);

  if (!auditData) {
    notFound();
  }

  return (
    <LeadPortal 
      companyName={auditData.companyName}
      videoUrl={auditData.videoUrl || ""}
      screenshotUrl={auditData.screenshotUrl || ""}
      annotations={auditData.annotations}
      uxScore={auditData.uxScore}
    />
  );
}
