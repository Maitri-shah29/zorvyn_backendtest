import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";

type CreateRecordInput = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  recordDate: Date;
  description?: string;
  notes?: string;
  createdById: string;
};

type UpdateRecordInput = Partial<Omit<CreateRecordInput, "createdById">>;

type ListRecordsInput = {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
};

function buildWhereClause(filters: ListRecordsInput): Prisma.FinancialRecordWhereInput {
  return {
    type: filters.type,
    category: filters.category
      ? {
          contains: filters.category,
          mode: "insensitive",
        }
      : undefined,
    recordDate:
      filters.startDate || filters.endDate
        ? {
            gte: filters.startDate,
            lte: filters.endDate,
          }
        : undefined,
  };
}

export async function createRecord(input: CreateRecordInput) {
  return prisma.financialRecord.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      category: input.category,
      recordDate: input.recordDate,
      description: input.description,
      notes: input.notes,
      createdById: input.createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function listRecords(filters: ListRecordsInput) {
  const where = buildWhereClause(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy: {
        recordDate: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function updateRecord(recordId: string, input: UpdateRecordInput) {
  const existingRecord = await prisma.financialRecord.findUnique({
    where: { id: recordId },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Financial record not found");
  }

  return prisma.financialRecord.update({
    where: { id: recordId },
    data: {
      amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
      type: input.type,
      category: input.category,
      recordDate: input.recordDate,
      description: input.description,
      notes: input.notes,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function deleteRecord(recordId: string) {
  const existingRecord = await prisma.financialRecord.findUnique({
    where: { id: recordId },
  });

  if (!existingRecord) {
    throw new ApiError(404, "Financial record not found");
  }

  await prisma.financialRecord.delete({
    where: { id: recordId },
  });
}
