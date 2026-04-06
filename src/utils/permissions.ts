import { Role } from "@prisma/client";

export type Permission =
  | "manageUsers"
  | "createRecord"
  | "updateRecord"
  | "deleteRecord"
  | "readUsers"
  | "readRecords"
  | "readDashboard"
  | "readInsights";

export const permissions: Record<Permission, Role[]> = {
  manageUsers: [Role.ADMIN],
  createRecord: [Role.ADMIN],
  updateRecord: [Role.ADMIN],
  deleteRecord: [Role.ADMIN],
  readUsers: [Role.ADMIN],
  readRecords: [Role.ADMIN, Role.ANALYST],
  readDashboard: [Role.ADMIN, Role.ANALYST, Role.VIEWER],
  readInsights: [Role.ADMIN, Role.ANALYST],
};

export function hasPermission(role: Role, permission: Permission) {
  return permissions[permission].includes(role);
}
