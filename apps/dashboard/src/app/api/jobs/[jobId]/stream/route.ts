import { hasDatabaseUrl } from "@leadforge/db";
import { getAsyncJobSnapshotById } from "@/lib/ai-jobs/executor";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  if (!hasDatabaseUrl()) {
    return new Response("DATABASE_URL is not configured.", { status: 503 });
  }

  const { jobId } = await context.params;
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const sendSnapshot = async () => {
        const snapshot = await getAsyncJobSnapshotById(jobId);

        if (!snapshot) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "Job not found." })}\n\n`));
          controller.close();
          if (timer) {
            clearInterval(timer);
          }
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));

        if (snapshot.status === "SUCCEEDED" || snapshot.status === "FAILED" || snapshot.status === "CANCELLED") {
          controller.close();
          if (timer) {
            clearInterval(timer);
          }
        }
      };

      await sendSnapshot();
      timer = setInterval(() => {
        void sendSnapshot();
      }, 1000);

      request.signal.addEventListener(
        "abort",
        () => {
          if (timer) {
            clearInterval(timer);
          }
          controller.close();
        },
        { once: true },
      );
    },
    cancel() {
      if (timer) {
        clearInterval(timer);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
