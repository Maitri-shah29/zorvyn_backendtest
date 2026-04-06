import { RecordType, type FinancialRecord } from "@prisma/client";

type SummaryRecord = Pick<FinancialRecord, "amount" | "type" | "category" | "recordDate" | "description" | "createdAt">;

function toNumber(value: unknown) {
  return Number(value);
}

export function buildDashboardSummary(records: SummaryRecord[]) {
  const totalIncome = records
    .filter((record) => record.type === RecordType.INCOME)
    .reduce((sum, record) => sum + toNumber(record.amount), 0);

  const totalExpenses = records
    .filter((record) => record.type === RecordType.EXPENSE)
    .reduce((sum, record) => sum + toNumber(record.amount), 0);

  const categoryTotals = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.category] = (acc[record.category] ?? 0) + toNumber(record.amount);
    return acc;
  }, {});

  const monthlyTrends = records.reduce<Record<string, { income: number; expense: number }>>((acc, record) => {
    const month = record.recordDate.toISOString().slice(0, 7);
    const bucket = acc[month] ?? { income: 0, expense: 0 };

    if (record.type === RecordType.INCOME) {
      bucket.income += toNumber(record.amount);
    } else {
      bucket.expense += toNumber(record.amount);
    }

    acc[month] = bucket;
    return acc;
  }, {});

  const recentActivity = [...records]
    .sort((left, right) => right.recordDate.getTime() - left.recordDate.getTime())
    .slice(0, 5)
    .map((record) => ({
      category: record.category,
      type: record.type,
      amount: toNumber(record.amount),
      recordDate: record.recordDate,
      description: record.description,
      createdAt: record.createdAt,
    }));

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    categoryTotals: Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
    })),
    monthlyTrends: Object.entries(monthlyTrends)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, totals]) => ({
        month,
        ...totals,
        net: totals.income - totals.expense,
      })),
    recentActivity,
  };
}
