import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { hasPermission } from "../src/utils/permissions";

describe("hasPermission", () => {
  it("allows admins to manage users and records", () => {
    expect(hasPermission(Role.ADMIN, "manageUsers")).toBe(true);
    expect(hasPermission(Role.ADMIN, "createRecord")).toBe(true);
    expect(hasPermission(Role.ADMIN, "deleteRecord")).toBe(true);
  });

  it("allows analysts to read records and insights but not mutate data", () => {
    expect(hasPermission(Role.ANALYST, "readRecords")).toBe(true);
    expect(hasPermission(Role.ANALYST, "readInsights")).toBe(true);
    expect(hasPermission(Role.ANALYST, "createRecord")).toBe(false);
  });

  it("limits viewers to read-only dashboard access", () => {
    expect(hasPermission(Role.VIEWER, "readDashboard")).toBe(true);
    expect(hasPermission(Role.VIEWER, "readRecords")).toBe(false);
    expect(hasPermission(Role.VIEWER, "manageUsers")).toBe(false);
  });
});
