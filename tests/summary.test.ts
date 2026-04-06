import { describe, expect, it } from "vitest";
import { Prisma, RecordType, type FinancialRecord } from "@prisma/client";
import { buildDashboardSummary } from "../src/utils/summary";

function makeRecord(overrides: Partial<FinancialRecord>): FinancialRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    amount: overrides.amount ?? new Prisma.Decimal(0),
    type: overrides.type ?? RecordType.EXPENSE,
    category: overrides.category ?? "General",
    recordDate: overrides.recordDate ?? new Date("2026-03-01T00:00:00.000Z"),
    description: overrides.description ?? null,
    notes: overrides.notes ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-03-01T00:00:00.000Z"),
    createdById: overrides.createdById ?? "user-1",
  };
}

describe("buildDashboardSummary", () => {
  it("computes financial totals, category totals, recent activity, and monthly trends", () => {
    const summary = buildDashboardSummary([
      makeRecord({
        amount: new Prisma.Decimal(5000),
        type: RecordType.INCOME,
        category: "Consulting",
        recordDate: new Date("2026-01-15T00:00:00.000Z"),
      }),
      makeRecord({
        amount: new Prisma.Decimal(1200),
        type: RecordType.EXPENSE,
        category: "Infrastructure",
        recordDate: new Date("2026-01-20T00:00:00.000Z"),
      }),
      makeRecord({
        amount: new Prisma.Decimal(2200),
        type: RecordType.INCOME,
        category: "Subscriptions",
        recordDate: new Date("2026-02-03T00:00:00.000Z"),
      }),
      makeRecord({
        amount: new Prisma.Decimal(800),
        type: RecordType.EXPENSE,
        category: "Payroll",
        recordDate: new Date("2026-02-08T00:00:00.000Z"),
      }),
    ]);

    expect(summary.totalIncome).toBe(7200);
    expect(summary.totalExpenses).toBe(2000);
    expect(summary.netBalance).toBe(5200);
    expect(summary.categoryTotals).toEqual(
      expect.arrayContaining([
        { category: "Consulting", total: 5000 },
        { category: "Infrastructure", total: 1200 },
        { category: "Subscriptions", total: 2200 },
        { category: "Payroll", total: 800 },
      ]),
    );
    expect(summary.monthlyTrends).toEqual([
      { month: "2026-01", income: 5000, expense: 1200, net: 3800 },
      { month: "2026-02", income: 2200, expense: 800, net: 1400 },
    ]);
    expect(summary.recentActivity[0]?.category).toBe("Payroll");
  });
});
