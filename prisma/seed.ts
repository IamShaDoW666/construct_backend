import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

async function main() {
  // Seed users
  const users = await prisma.user.createMany({
    data: [
      { name: "John Doe", email: "john.doe@example.com" },
      { name: "Jane Smith", email: "jane.smith@example.com" },
      { name: "Alice Johnson", email: "alice.johnson@example.com" },
    ],
  });

  console.log(`${users.count} users created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
