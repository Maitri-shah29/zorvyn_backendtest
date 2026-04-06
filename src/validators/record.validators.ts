import { RecordType } from "@prisma/client";
import { z } from "zod";

const optionalString = z.string().trim().min(1).max(500).optional();

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    type: z.enum(RecordType),
    category: z.string().trim().min(2).max(100),
    recordDate: z.coerce.date(),
    description: optionalString,
    notes: optionalString,
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateRecordSchema = z.object({
  body: z
    .object({
      amount: z.coerce.number().positive().optional(),
      type: z.enum(RecordType).optional(),
      category: z.string().trim().min(2).max(100).optional(),
      recordDate: z.coerce.date().optional(),
      description: optionalString,
      notes: optionalString,
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "At least one field must be provided",
    }),
  params: z.object({
    recordId: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

export const listRecordsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    type: z.enum(RecordType).optional(),
    category: z.string().trim().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  }).refine((query) => {
    if (!query.startDate || !query.endDate) {
      return true;
    }

    return query.startDate <= query.endDate;
  }, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  }),
});
