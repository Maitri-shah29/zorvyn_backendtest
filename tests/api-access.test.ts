import request from "supertest";
import type { Express } from "express";
import { Role, UserStatus } from "@prisma/client";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/record.service", () => ({
  createRecord: vi.fn(),
  listRecords: vi.fn().mockResolvedValue({
    items: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  }),
  updateRecord: vi.fn(),
  deleteRecord: vi.fn(),
}));

vi.mock("../src/services/dashboard.service", () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    categoryTotals: [],
    monthlyTrends: [],
    recentActivity: [],
  }),
}));

type SignPayload = {
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
};

let appInstance: Express;
let signAccessToken: (payload: SignPayload) => string;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret";

  const [{ app }, jwt] = await Promise.all([
    import("../src/app.js"),
    import("../src/utils/jwt.js"),
  ]);

  appInstance = app;
  signAccessToken = jwt.signAccessToken;
});

function createToken(role: Role) {
  return signAccessToken({
    sub: "user-1",
    email: "user@finance.local",
    role,
    status: UserStatus.ACTIVE,
  });
}

describe("API auth, RBAC, and validation", () => {
  it("returns health status without auth", async () => {
    const response = await request(appInstance).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects protected endpoints when token is missing", async () => {
    const response = await request(appInstance).get("/api/records");

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/authorization token/i);
  });

  it("blocks viewer role from insights endpoint", async () => {
    const token = createToken(Role.VIEWER);

    const response = await request(appInstance)
      .get("/api/dashboard/insights")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/permission/i);
  });

  it("allows analyst role to read records", async () => {
    const token = createToken(Role.ANALYST);

    const response = await request(appInstance)
      .get("/api/records")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("pagination");
  });

  it("blocks viewer role from reading records", async () => {
    const token = createToken(Role.VIEWER);

    const response = await request(appInstance)
      .get("/api/records")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/permission/i);
  });

  it("rejects invalid dashboard date ranges", async () => {
    const token = createToken(Role.ANALYST);

    const response = await request(appInstance)
      .get("/api/dashboard/summary")
      .query({
        startDate: "2026-05-10",
        endDate: "2026-05-01",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects invalid record filter date ranges", async () => {
    const token = createToken(Role.ADMIN);

    const response = await request(appInstance)
      .get("/api/records")
      .query({
        startDate: "2026-05-10",
        endDate: "2026-05-01",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });
});
