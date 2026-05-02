/**
 * Multi-Channel Sequence Engine for LeadForge AI
 *
 * Manages outreach sequences that run across email, LinkedIn, SMS, and phone.
 * Each sequence is a series of time-delayed steps that execute in order.
 *
 * Design principles:
 * - Every external action goes through the approval boundary
 * - Human can pause, skip, or exit any enrollment
 * - Sequences compose with the existing lead pipeline state
 */

import { getPrisma } from "@leadforge/db";

export type SequenceStepKind =
  | "EMAIL"
  | "LINKEDIN_CONNECTION"
  | "LINKEDIN_MESSAGE"
  | "SMS"
  | "PHONE_CALL"
  | "WAIT"
  | "TASK";

export type ChannelStats = {
  channel: string;
  label: string;
  icon: string;
  sent: number;
  replied: number;
  replyRate: string;
  trend: string;
};

export type SequenceSummary = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  targetSegment?: string | null;
  stepCount: number;
  channels: SequenceStepKind[];
  totalEnrolled: number;
  totalCompleted: number;
  totalReplied: number;
  replyRate: string;
  steps: Array<{
    stepNumber: number;
    kind: string;
    delayDays: number;
    delayHours: number;
    subject?: string | null;
    bodyTemplate?: string | null;
    taskNote?: string | null;
  }>;
};

export type EnrollmentSummary = {
  id: string;
  sequenceId: string;
  sequenceName: string;
  leadId: string;
  leadName: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStepAt?: string | null;
  channels: string[];
};

export type SequenceBuilderStep = {
  stepNumber: number;
  kind: SequenceStepKind;
  delayDays: number;
  delayHours: number;
  subject?: string;
  bodyTemplate?: string;
  taskNote?: string;
};

/**
 * Get all outreach sequences for a workspace with their stats.
 */
export async function getWorkspaceSequences(
  workspaceId: string,
): Promise<SequenceSummary[]> {
  if (!workspaceId || workspaceId === "demo") {
    return getDemoSequences();
  }

  try {
    const prisma = getPrisma();
    const sequences = await prisma.outreachSequence.findMany({
      where: { workspaceId },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sequences.map((seq) => {
      const channels = [...new Set(seq.steps.map((s) => s.kind))] as SequenceStepKind[];
      const replyRate =
        seq.totalEnrolled > 0
          ? `${Math.round((seq.totalReplied / seq.totalEnrolled) * 100)}%`
          : "0%";

      return {
        id: seq.id,
        name: seq.name,
        description: seq.description,
        isActive: seq.isActive,
        targetSegment: seq.targetSegment,
        stepCount: seq.steps.length,
        channels,
        totalEnrolled: seq.totalEnrolled,
        totalCompleted: seq.totalCompleted,
        totalReplied: seq.totalReplied,
        replyRate,
        steps: seq.steps.map((s) => ({
          stepNumber: s.stepNumber,
          kind: s.kind,
          delayDays: s.delayDays,
          delayHours: s.delayHours,
          subject: s.subject,
          bodyTemplate: s.bodyTemplate,
          taskNote: s.taskNote,
        })),
      };
    });
  } catch (error) {
    console.error("Failed to fetch workspace sequences:", error);
    return getDemoSequences();
  }
}

/**
 * Get active enrollments for a lead.
 */
export async function getLeadSequenceEnrollments(
  leadId: string,
): Promise<EnrollmentSummary[]> {
  if (!leadId) return [];

  const prisma = getPrisma();
  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { leadId },
    include: {
      sequence: {
        include: { steps: { orderBy: { stepNumber: "asc" } } },
      },
      lead: { select: { company: true, contactName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => {
    const channels = [
      ...new Set(enrollment.sequence.steps.map((s) => s.kind)),
    ];

    return {
      id: enrollment.id,
      sequenceId: enrollment.sequenceId,
      sequenceName: enrollment.sequence.name,
      leadId: enrollment.leadId,
      leadName: enrollment.lead.contactName ?? enrollment.lead.company,
      currentStep: enrollment.currentStep,
      totalSteps: enrollment.sequence.steps.length,
      status: enrollment.status,
      nextStepAt: enrollment.nextStepAt?.toISOString() ?? null,
      channels,
    };
  });
}

/**
 * Calculate the next step execution time for an enrollment.
 */
export function calculateNextStepTime(
  fromDate: Date,
  delayDays: number,
  delayHours: number,
): Date {
  const ms =
    (delayDays * 24 * 60 * 60 + delayHours * 60 * 60) * 1000;
  return new Date(fromDate.getTime() + ms);
}

/**
 * Get workspace-level channel performance analytics.
 */
export async function getChannelPerformanceStats(
  workspaceId: string,
): Promise<ChannelStats[]> {
  if (workspaceId === "demo") {
    return getDemoChannelStats();
  }

  try {
    const prisma = getPrisma();

    const [smsStats, dialerStats, liStats] = await Promise.all([
      prisma.smsMessage.aggregate({
        where: { lead: { workspaceId }, direction: "OUTBOUND" },
        _count: { id: true },
      }),
      prisma.dialerCall.aggregate({
        where: { lead: { workspaceId }, direction: "OUTBOUND" },
        _count: { id: true },
      }),
      prisma.linkedInActivity.aggregate({
        where: { lead: { workspaceId } },
        _count: { id: true },
      }),
    ]);

    const emailApprovals = await prisma.approval.count({
      where: {
        lead: { workspaceId },
        status: "APPROVED",
      },
    });

    return [
      {
        channel: "EMAIL",
        label: "Email",
        icon: "✉️",
        sent: emailApprovals,
        replied: 0,
        replyRate: "–",
        trend: "primary",
      },
      {
        channel: "LINKEDIN",
        label: "LinkedIn",
        icon: "💼",
        sent: liStats._count.id,
        replied: 0,
        replyRate: "–",
        trend: "secondary",
      },
      {
        channel: "SMS",
        label: "SMS",
        icon: "💬",
        sent: smsStats._count.id,
        replied: 0,
        replyRate: "–",
        trend: "accent",
      },
      {
        channel: "PHONE",
        label: "Phone",
        icon: "📞",
        sent: dialerStats._count.id,
        replied: 0,
        replyRate: "–",
        trend: "neutral",
      },
    ];
  } catch (error) {
    console.error("Failed to fetch channel performance stats:", error);
    return getDemoChannelStats();
  }
}

// ── Demo data for non-database mode ──────────────────────────────────────────

function getDemoSequences(): SequenceSummary[] {
  return [
    {
      id: "demo-seq-1",
      name: "Cold Outreach — Founder SaaS",
      description: "A 5-touch sequence across email and LinkedIn for SaaS founders.",
      isActive: true,
      targetSegment: "SaaS / B2B",
      stepCount: 5,
      channels: ["EMAIL", "LINKEDIN_CONNECTION", "LINKEDIN_MESSAGE", "EMAIL", "PHONE_CALL"],
      totalEnrolled: 23,
      totalCompleted: 14,
      totalReplied: 7,
      replyRate: "30%",
      steps: [
        { stepNumber: 1, kind: "EMAIL", delayDays: 0, delayHours: 0, subject: "Quick thought on {{company}}", bodyTemplate: "Hi {{name}}, I noticed..." },
        { stepNumber: 2, kind: "LINKEDIN_CONNECTION", delayDays: 2, delayHours: 0, taskNote: "Send connection with personal note." },
        { stepNumber: 3, kind: "LINKEDIN_MESSAGE", delayDays: 4, delayHours: 0, bodyTemplate: "Thanks for connecting, {{name}}..." },
        { stepNumber: 4, kind: "EMAIL", delayDays: 7, delayHours: 0, subject: "Re: {{company}}", bodyTemplate: "Following up briefly..." },
        { stepNumber: 5, kind: "PHONE_CALL", delayDays: 10, delayHours: 0, taskNote: "Call at 10am local time. Ask about growth goals." },
      ],
    },
    {
      id: "demo-seq-2",
      name: "Inbound Lead — Fast Response",
      description: "Rapid 3-touch response for inbound leads within 48h.",
      isActive: true,
      targetSegment: "Inbound",
      stepCount: 3,
      channels: ["EMAIL", "SMS", "PHONE_CALL"],
      totalEnrolled: 11,
      totalCompleted: 9,
      totalReplied: 5,
      replyRate: "45%",
      steps: [
        { stepNumber: 1, kind: "EMAIL", delayDays: 0, delayHours: 1, subject: "Got your request!", bodyTemplate: "Hi {{name}}, thanks for reaching out..." },
        { stepNumber: 2, kind: "SMS", delayDays: 0, delayHours: 4, bodyTemplate: "Hi {{name}}, just wanted to follow up via text..." },
        { stepNumber: 3, kind: "PHONE_CALL", delayDays: 1, delayHours: 0, taskNote: "Call to confirm interest and book a demo." },
      ],
    },
    {
      id: "demo-seq-3",
      name: "Agency Outreach — SMB",
      description: "6-step multi-channel sequence targeting small business owners.",
      isActive: false,
      targetSegment: "SMB",
      stepCount: 6,
      channels: ["EMAIL", "LINKEDIN_CONNECTION", "SMS", "EMAIL", "PHONE_CALL", "EMAIL"],
      totalEnrolled: 8,
      totalCompleted: 3,
      totalReplied: 2,
      replyRate: "25%",
      steps: [],
    },
  ];
}

function getDemoChannelStats(): ChannelStats[] {
  return [
    { channel: "EMAIL", label: "Email", icon: "✉️", sent: 47, replied: 12, replyRate: "25.5%", trend: "primary" },
    { channel: "LINKEDIN", label: "LinkedIn", icon: "💼", sent: 23, replied: 8, replyRate: "34.8%", trend: "secondary" },
    { channel: "SMS", label: "SMS", icon: "💬", sent: 18, replied: 6, replyRate: "33.3%", trend: "accent" },
    { channel: "PHONE", label: "Phone", icon: "📞", sent: 11, replied: 4, replyRate: "36.4%", trend: "neutral" },
  ];
}
