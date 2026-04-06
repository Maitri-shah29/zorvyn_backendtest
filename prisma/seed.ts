import { PrismaClient, Role, UserStatus, RecordType } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hashPassword("Admin@123");
  const analystPasswordHash = await hashPassword("Analyst@123");
  const viewerPasswordHash = await hashPassword("Viewer@123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@finance.local" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: "analyst@finance.local" },
    update: {},
    create: {
      name: "Data Analyst",
      email: "analyst@finance.local",
      passwordHash: analystPasswordHash,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
      createdById: admin.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@finance.local" },
    update: {},
    create: {
      name: "Dashboard Viewer",
      email: "viewer@finance.local",
      passwordHash: viewerPasswordHash,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
      createdById: admin.id,
    },
  });

  const existingRecords = await prisma.financialRecord.count();

  if (existingRecords === 0) {
    await prisma.financialRecord.createMany({
      data: [
        {
          amount: 6200,
          type: RecordType.INCOME,
          category: "Consulting",
          recordDate: new Date("2026-03-02"),
          description: "Quarterly consulting revenue",
          notes: "Paid by enterprise client",
          createdById: admin.id,
        },
        {
          amount: 2400,
          type: RecordType.INCOME,
          category: "Subscriptions",
          recordDate: new Date("2026-03-12"),
          description: "Monthly recurring subscriptions",
          createdById: admin.id,
        },
        {
          amount: 1800,
          type: RecordType.EXPENSE,
          category: "Infrastructure",
          recordDate: new Date("2026-03-10"),
          description: "Cloud hosting bill",
          createdById: admin.id,
        },
        {
          amount: 950,
          type: RecordType.EXPENSE,
          category: "Payroll",
          recordDate: new Date("2026-03-18"),
          description: "Contractor payout",
          createdById: admin.id,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
