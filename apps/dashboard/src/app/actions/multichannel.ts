"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { auth } from "@/auth";
import { getActiveWorkspace } from "@/lib/workspace";
import {
  sendSmsMessage,
  hasTwilioCredentials,
  normalizePhoneNumber,
  buildLinkedInConnectionRequest,
  buildLinkedInMessage,
  sendLinkedInInMail,
  hasLinkedInCredentials,
  hasLinkedInSalesNavigator,
  initiateDialerCall,
} from "@leadforge/integrations";
import { calculateNextStepTime } from "@/lib/sequence-engine";

// ── Validation schemas ────────────────────────────────────────────────────────

const smsOutreachSchema = z.object({
  leadId: z.string().trim().min(2),
  to: z.string().trim().min(7).max(20),
  body: z.string().trim().min(1).max(1600),
  outreachDraftId: z.string().trim().optional(),
});

const linkedInOutreachSchema = z.object({
  leadId: z.string().trim().min(2),
  activityType: z.enum(["CONNECTION_REQUEST", "INMAIL", "MESSAGE"]),
  message: z.string().trim().max(8000).optional(),
  note: z.string().trim().max(300).optional(),
  linkedinProfileUrl: z.string().trim().url().optional().or(z.literal("")),
  outreachDraftId: z.string().trim().optional(),
});

const scheduleCallSchema = z.object({
  leadId: z.string().trim().min(2),
  contactPhone: z.string().trim().min(7).max(20),
  note: z.string().trim().max(1000).optional(),
  scheduledAtIso: z.string().trim().optional(),
  recordCall: z.enum(["1", "0"]).optional(),
  initiateNow: z.enum(["1", "0"]).optional(),
});

const bookMeetingSchema = z.object({
  leadId: z.string().trim().min(2),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  startAtIso: z.string().trim().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  meetingUrl: z.string().trim().url().optional().or(z.literal("")),
  location: z.string().trim().max(300).optional(),
  attendeeEmails: z.string().trim().max(1000).optional(),
});

const createSequenceSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional(),
  targetSegment: z.string().trim().max(120).optional(),
  stepsJson: z.string().trim().min(2),
});

const enrollLeadSchema = z.object({
  leadId: z.string().trim().min(2),
  sequenceId: z.string().trim().min(2),
});

// ── SMS Actions ───────────────────────────────────────────────────────────────

export async function sendSmsOutreach(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const session = await auth();

  if (session?.user?.id === "demo-user") {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    redirect(`/leads/${leadId}?run=sms-demo`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  const parsed = smsOutreachSchema.safeParse({
    leadId: formData.get("leadId"),
    to: formData.get("to"),
    body: formData.get("body"),
    outreachDraftId: formData.get("outreachDraftId"),
  });

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=sms-invalid`);
  }

  const { leadId: lid, to, body, outreachDraftId } = parsed.data;
  const normalizedTo = normalizePhoneNumber(to);

  if (!normalizedTo) {
    redirect(`/leads/${lid}?run=sms-invalid-phone`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: lid } });
    if (!lead) redirect(`/leads/${lid}?run=missing`);

    // Check approval if draft is linked
    if (outreachDraftId) {
      const approval = await prisma.approval.findFirst({
        where: { leadId: lid, outreachDraftId, status: "APPROVED" },
      });
      if (!approval) redirect(`/leads/${lid}?run=sms-awaiting-approval`);
    }

    const fromNumber = process.env.TWILIO_FROM_NUMBER ?? "+15550000000";
    let twilioSid: string | undefined;
    let smsStatus: "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "UNDELIVERED" = "QUEUED";
    let twilioError: string | undefined;

    if (hasTwilioCredentials()) {
      const result = await sendSmsMessage({ to: normalizedTo, body });
      twilioSid = result.twilioSid;
      smsStatus = result.success ? "SENT" : "FAILED";
      twilioError = result.errorMessage;
    }
    // Without Twilio, message is recorded as QUEUED for manual delivery

    const smsRecord = await prisma.smsMessage.create({
      data: {
        leadId: lid,
        direction: "OUTBOUND",
        to: normalizedTo,
        from: fromNumber,
        body,
        status: smsStatus,
        twilioSid: twilioSid ?? null,
        twilioError: twilioError ?? null,
        sentAt: smsStatus === "SENT" ? new Date() : null,
        approvalId: outreachDraftId ?? null,
      },
    });

    await prisma.agentTrace.create({
      data: {
        leadId: lid,
        agentName: "SMS Bridge",
        status: smsStatus === "SENT" ? "SUCCEEDED" : "QUEUED",
        input: { to: normalizedTo, channel: "SMS", smsId: smsRecord.id },
        output: {
          message: hasTwilioCredentials()
            ? `SMS ${smsStatus === "SENT" ? "sent" : "failed"} via Twilio.`
            : "SMS queued. Connect Twilio to enable live sending.",
          twilioSid,
        },
      },
    });

    if (twilioError) {
      await prisma.smsMessage.update({
        where: { id: smsRecord.id },
        data: { status: "FAILED", twilioError },
      });
      redirect(`/leads/${lid}?run=sms-error`);
    }

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${lid}?run=sms-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(
    hasTwilioCredentials()
      ? `/leads/${leadId}?run=sms-sent`
      : `/leads/${leadId}?run=sms-queued`,
  );
}

// ── LinkedIn Actions ──────────────────────────────────────────────────────────

export async function queueLinkedInOutreach(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const session = await auth();

  if (session?.user?.id === "demo-user") {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    redirect(`/leads/${leadId}?run=linkedin-demo`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  const parsed = linkedInOutreachSchema.safeParse({
    leadId: formData.get("leadId"),
    activityType: formData.get("activityType"),
    message: formData.get("message"),
    note: formData.get("note"),
    linkedinProfileUrl: formData.get("linkedinProfileUrl"),
    outreachDraftId: formData.get("outreachDraftId"),
  });

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=linkedin-invalid`);
  }

  const { leadId: lid, activityType, message, note, linkedinProfileUrl, outreachDraftId } = parsed.data;

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: lid } });
    if (!lead) redirect(`/leads/${lid}?run=missing`);

    // Check approval if draft is linked
    if (outreachDraftId) {
      const approval = await prisma.approval.findFirst({
        where: { leadId: lid, outreachDraftId, status: "APPROVED" },
      });
      if (!approval) redirect(`/leads/${lid}?run=linkedin-awaiting-approval`);
    }

    let externalMessageId: string | undefined;
    let sentStatus = "PENDING";

    // Attempt live InMail if Sales Navigator is configured
    if (activityType === "INMAIL" && hasLinkedInSalesNavigator() && message) {
      try {
        const result = await sendLinkedInInMail(
          { accessToken: process.env.LINKEDIN_SALES_NAVIGATOR_TOKEN ?? null },
          {
            recipientProfileUrl: linkedinProfileUrl ?? "",
            body: message,
            isInMail: true,
          },
        );
        if (result.status === "SENT") {
          sentStatus = "SENT";
          externalMessageId = result.externalMessageId;
        }
      } catch {
        sentStatus = "PENDING"; // Fall back to queued for manual execution
      }
    } else if (activityType === "CONNECTION_REQUEST" && note) {
      // Validate note length
      buildLinkedInConnectionRequest({
        recipientProfileUrl: linkedinProfileUrl ?? "",
        recipientName: lead.contactName ?? lead.company,
        note,
      });
    } else if (activityType === "MESSAGE" && message) {
      buildLinkedInMessage({
        recipientProfileUrl: linkedinProfileUrl ?? "",
        body: message,
        isInMail: false,
      });
    }

    const activity = await prisma.linkedInActivity.create({
      data: {
        leadId: lid,
        activityType,
        status: sentStatus,
        message: message ?? note ?? null,
        linkedinProfileUrl: linkedinProfileUrl || lead.linkedinUrl || null,
        externalMessageId: externalMessageId ?? null,
        sentAt: sentStatus === "SENT" ? new Date() : null,
        approvalId: outreachDraftId ?? null,
      },
    });

    await prisma.agentTrace.create({
      data: {
        leadId: lid,
        agentName: "LinkedIn Bridge",
        status: sentStatus === "SENT" ? "SUCCEEDED" : "QUEUED",
        input: { activityType, channel: "LINKEDIN", activityId: activity.id },
        output: {
          message:
            sentStatus === "SENT"
              ? `LinkedIn ${activityType} sent via Sales Navigator.`
              : `LinkedIn ${activityType} queued for manual delivery. ${hasLinkedInCredentials() ? "API connected." : "Connect LinkedIn OAuth to enable automated sending."}`,
        },
      },
    });

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${lid}?run=linkedin-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=linkedin-queued`);
}

// ── Dialer / Call Actions ─────────────────────────────────────────────────────

export async function scheduleOrInitiateCall(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const session = await auth();

  if (session?.user?.id === "demo-user") {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    redirect(`/leads/${leadId}?run=call-demo`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  const parsed = scheduleCallSchema.safeParse({
    leadId: formData.get("leadId"),
    contactPhone: formData.get("contactPhone"),
    note: formData.get("note"),
    scheduledAtIso: formData.get("scheduledAtIso"),
    recordCall: formData.get("recordCall"),
    initiateNow: formData.get("initiateNow"),
  });

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=call-invalid`);
  }

  const {
    leadId: lid,
    contactPhone,
    note,
    scheduledAtIso,
    recordCall,
    initiateNow,
  } = parsed.data;

  const normalizedPhone = normalizePhoneNumber(contactPhone);
  if (!normalizedPhone) redirect(`/leads/${lid}?run=call-invalid-phone`);

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: lid } });
    if (!lead) redirect(`/leads/${lid}?run=missing`);

    const shouldInitiateNow = initiateNow === "1" && hasTwilioCredentials();
    let twilioCallSid: string | undefined;
    let callStatus: "SCHEDULED" | "IN_PROGRESS" | "FAILED" = "SCHEDULED";

    if (shouldInitiateNow) {
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations/twilio/twiml`;
      const statusCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations/twilio/call-status`;
      const result = await initiateDialerCall({
        to: normalizedPhone!,
        callbackUrl,
        statusCallbackUrl,
        recordCall: recordCall === "1",
        machineDetection: true,
        leadId: lid,
      });
      twilioCallSid = result.twilioCallSid;
      callStatus = result.success ? "IN_PROGRESS" : "FAILED";
    }

    const call = await prisma.dialerCall.create({
      data: {
        leadId: lid,
        contactPhone: normalizedPhone!,
        direction: "OUTBOUND",
        status: callStatus,
        notes: note ?? null,
        twilioCallSid: twilioCallSid ?? null,
        scheduledAt: scheduledAtIso ? new Date(scheduledAtIso) : null,
        startedAt: shouldInitiateNow ? new Date() : null,
      },
    });

    await prisma.agentTrace.create({
      data: {
        leadId: lid,
        agentName: "Dialer Bridge",
        status: callStatus === "FAILED" ? "FAILED" : "SUCCEEDED",
        input: { phone: normalizedPhone, channel: "PHONE", callId: call.id },
        output: {
          message: shouldInitiateNow
            ? `Call initiated via Twilio (SID: ${twilioCallSid ?? "pending"}).`
            : `Call scheduled for ${scheduledAtIso ?? "manual execution"}.`,
        },
      },
    });

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=call-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(
    initiateNow === "1"
      ? `/leads/${leadId}?run=call-initiated`
      : `/leads/${leadId}?run=call-scheduled`,
  );
}

// ── Calendar / Meeting Actions ────────────────────────────────────────────────

export async function bookMeeting(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const session = await auth();

  if (session?.user?.id === "demo-user") {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    redirect(`/leads/${leadId}?run=meeting-demo`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  const parsed = bookMeetingSchema.safeParse({
    leadId: formData.get("leadId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startAtIso: formData.get("startAtIso"),
    durationMinutes: formData.get("durationMinutes"),
    meetingUrl: formData.get("meetingUrl"),
    location: formData.get("location"),
    attendeeEmails: formData.get("attendeeEmails"),
  });

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=meeting-invalid`);
  }

  const {
    leadId: lid,
    title,
    description,
    startAtIso,
    durationMinutes,
    meetingUrl,
    location,
    attendeeEmails,
  } = parsed.data;

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();
    const lead = await prisma.lead.findUnique({ where: { id: lid } });
    if (!lead) redirect(`/leads/${lid}?run=missing`);

    const startAt = new Date(startAtIso);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);
    const emailList = attendeeEmails
      ? attendeeEmails.split(/[,\n]/).map((e) => e.trim()).filter(Boolean)
      : [];

    if (lead.contactEmail && !emailList.includes(lead.contactEmail)) {
      emailList.unshift(lead.contactEmail);
    }

    const event = await prisma.calendarEvent.create({
      data: {
        workspaceId: workspace.id,
        leadId: lid,
        title,
        description: description ?? null,
        startAt,
        endAt,
        durationMinutes,
        meetingUrl: meetingUrl || null,
        location: location || null,
        attendeeEmails: emailList,
        status: "SCHEDULED",
      },
    });

    await prisma.outcomeEvent.create({
      data: {
        leadId: lid,
        eventType: "MEETING_BOOKED",
        note: `Meeting "${title}" booked for ${startAt.toLocaleString()}.`,
        source: "calendar_scheduler",
        metadata: {
          calendarEventId: event.id,
          durationMinutes,
          attendeeCount: emailList.length,
        },
      },
    });

    await prisma.agentTrace.create({
      data: {
        leadId: lid,
        agentName: "Calendar Bridge",
        status: "SUCCEEDED",
        input: { title, startAt: startAtIso, channel: "CALENDAR" },
        output: { message: `Meeting booked: "${title}"`, eventId: event.id },
      },
    });

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=meeting-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=meeting-booked`);
}

// ── Sequence Actions ──────────────────────────────────────────────────────────

export async function createOutreachSequence(formData: FormData) {
  const session = await auth();
  if (session?.user?.id === "demo-user") {
    revalidatePath("/");
    redirect("/?view=sequences&run=sequence-demo");
  }

  if (!hasDatabaseUrl()) {
    redirect("/?view=sequences&run=db-not-configured");
  }

  const parsed = createSequenceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    targetSegment: formData.get("targetSegment"),
    stepsJson: formData.get("stepsJson"),
  });

  if (!parsed.success) {
    redirect("/?view=sequences&run=invalid");
  }

  let steps: Array<{
    stepNumber: number;
    kind: string;
    delayDays?: number;
    delayHours?: number;
    subject?: string;
    bodyTemplate?: string;
    taskNote?: string;
  }>;
  try {
    steps = JSON.parse(parsed.data.stepsJson) as typeof steps;
  } catch {
    redirect("/?view=sequences&run=invalid-steps");
  }

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    const sequence = await prisma.outreachSequence.create({
      data: {
        workspaceId: workspace.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        targetSegment: parsed.data.targetSegment ?? null,
        steps: {
          create: steps.map((step) => ({
            stepNumber: step.stepNumber,
            kind: step.kind as "EMAIL" | "LINKEDIN_CONNECTION" | "LINKEDIN_MESSAGE" | "SMS" | "PHONE_CALL" | "WAIT" | "TASK",
            delayDays: step.delayDays ?? 0,
            delayHours: step.delayHours ?? 0,
            subject: step.subject ?? null,
            bodyTemplate: step.bodyTemplate ?? null,
            taskNote: step.taskNote ?? null,
          })),
        },
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });

    // Dynamically enroll eligible leads from the intelligence research dossier phase
    const eligibleLeads = await prisma.lead.findMany({
      where: {
        workspaceId: workspace.id,
        status: { in: ["APPROVAL", "READY", "DRAFTED"] }, // Targeting leads that have passed initial research/audit
        ...(parsed.data.targetSegment ? { segment: parsed.data.targetSegment } : {}),
      },
      select: { id: true },
    });

    if (eligibleLeads.length > 0 && sequence.steps.length > 0) {
      const firstStep = sequence.steps[0];
      const nextStepAt = firstStep
        ? calculateNextStepTime(new Date(), firstStep.delayDays, firstStep.delayHours)
        : null;

      await prisma.sequenceEnrollment.createMany({
        data: eligibleLeads.map((lead) => ({
          sequenceId: sequence.id,
          leadId: lead.id,
          currentStep: 0,
          status: "PENDING",
          nextStepAt,
        })),
        skipDuplicates: true,
      });

      await prisma.outreachSequence.update({
        where: { id: sequence.id },
        data: { totalEnrolled: eligibleLeads.length },
      });

      // Log agent trace for bulk enrollment
      await prisma.agentTrace.createMany({
        data: eligibleLeads.map((lead) => ({
          leadId: lead.id,
          agentName: "Sequence Engine",
          status: "SUCCEEDED",
          input: { sequenceId: sequence.id, action: "bulk_enroll" },
          output: {
            message: `Lead dynamically enrolled in sequence "${sequence.name}" via segment matching.`,
            nextStepAt: nextStepAt?.toISOString(),
            totalSteps: sequence.steps.length,
          },
        })),
      });
    }

  } catch (error) {
    unstable_rethrow(error);
    redirect("/?view=sequences&run=db-error");
  }

  revalidatePath("/");
  redirect("/?view=sequences&run=sequence-created");
}

export async function enrollLeadInSequence(formData: FormData) {
  const parsed = enrollLeadSchema.safeParse({
    leadId: formData.get("leadId"),
    sequenceId: formData.get("sequenceId"),
  });

  if (!parsed.success) {
    redirect("/?view=sequences&run=enroll-invalid");
  }

  const { leadId, sequenceId } = parsed.data;

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const sequence = await prisma.outreachSequence.findUnique({
      where: { id: sequenceId },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    });

    if (!sequence || !sequence.isActive) {
      redirect(`/leads/${leadId}?run=sequence-not-found`);
    }

    const firstStep = sequence.steps[0];
    const nextStepAt = firstStep
      ? calculateNextStepTime(new Date(), firstStep.delayDays, firstStep.delayHours)
      : null;

    await prisma.sequenceEnrollment.upsert({
      where: { sequenceId_leadId: { sequenceId, leadId } },
      update: {
        status: "PENDING",
        currentStep: 0,
        nextStepAt,
        pausedAt: null,
        exitReason: null,
        completedAt: null,
      },
      create: {
        sequenceId,
        leadId,
        currentStep: 0,
        status: "PENDING",
        nextStepAt,
      },
    });

    await prisma.outreachSequence.update({
      where: { id: sequenceId },
      data: { totalEnrolled: { increment: 1 } },
    });

    await prisma.agentTrace.create({
      data: {
        leadId,
        agentName: "Sequence Engine",
        status: "SUCCEEDED",
        input: { sequenceId, action: "enroll" },
        output: {
          message: `Lead enrolled in sequence "${sequence.name}".`,
          nextStepAt: nextStepAt?.toISOString(),
          totalSteps: sequence.steps.length,
        },
      },
    });

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=enroll-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=sequence-enrolled`);
}

export async function pauseSequenceEnrollment(formData: FormData) {
  const enrollmentId = z.string().min(1).parse(formData.get("enrollmentId"));
  const leadId = z.string().min(1).parse(formData.get("leadId"));

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "SKIPPED", pausedAt: new Date() },
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=pause-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=sequence-paused`);
}
