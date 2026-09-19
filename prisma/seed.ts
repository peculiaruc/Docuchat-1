import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";

const DEMO_EMAIL = "demo@docuchat.dev";
const DEMO_PASSWORD = "DemoPass1!";

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      passwordHash,
      isActive: true,
    },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      role: "USER",
      tier: "FREE",
    },
  });

  const existingDoc = await prisma.document.findFirst({
    where: { userId: user.id },
  });
  if (!existingDoc) {
    await prisma.document.create({
      data: {
        userId: user.id,
        status: "pending",
      },
    });
  }

  console.log("Seed complete");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
