import { Worker, Job } from "bullmq";
import { redisConnection } from "./connection";
import { openaiBreaker } from "../lib/http/openai.breaker";

export const embeddingWorker = new Worker(
  "embedding-generation",
  async (job: Job) => {
    return openaiBreaker.fire("/embeddings", {
      input: job.data.text,
      model: "text-embedding-3-small",
    });
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 60000,
    },
  }
);

embeddingWorker.on("failed", (job, error) => {
  console.error(
    `Embedding job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
    error.message
  );
});

embeddingWorker.on("error", (error) => {
  console.error("Embedding worker error:", error);
});
