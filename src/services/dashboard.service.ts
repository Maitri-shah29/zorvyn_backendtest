import { prisma } from "../lib/prisma";
import { buildDashboardSummary } from "../utils/summary";

type DashboardFilters = {
  startDate?: Date;
  endDate?: Date;
};

export async function getDashboardSummary(filters: DashboardFilters) {
  const records = await prisma.financialRecord.findMany({
    where:
      filters.startDate || filters.endDate
        ? {
            recordDate: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }
        : undefined,
    orderBy: {
      recordDate: "desc",
    },
  });

  return buildDashboardSummary(records);
}
