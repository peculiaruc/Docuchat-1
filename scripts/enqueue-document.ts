import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { queueDocumentProcessing } from "../src/queues/document.queue.js";
import { redisConnection } from "../src/queues/connection.js";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("No user found. Register or run npx prisma db seed first.");
  }

  const doc = await prisma.document.create({
    data: {
      userId: user.id,
      status: "pending",
      content:
        "DocuChat chunks this text so the embedding worker has something to embed.",
    },
  });

  const jobId = await queueDocumentProcessing(doc.id, user.id);
  console.log({ userId: user.id, documentId: doc.id, jobId });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await redisConnection.quit();
  });
