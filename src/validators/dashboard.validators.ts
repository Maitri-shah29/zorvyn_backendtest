import { z } from "zod";

export const dashboardSummarySchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
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
