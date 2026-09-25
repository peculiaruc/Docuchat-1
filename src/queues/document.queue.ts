import { redisConnection } from "./connection";
import { Queue } from "bullmq";

export const documentQueue = new Queue("document-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 200 },
  },
});

export async function queueDocumentProcessing(
  documentId: string,
  userId: string
) {
  const job = await documentQueue.add("process-document", {
    documentId,
    userId,
    queuedAt: Date.now(),
  });
  return job.id;
}
