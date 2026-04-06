import type { NextFunction, Request, Response } from "express";
import type { Permission } from "../utils/permissions";
import { hasPermission } from "../utils/permissions";
import { ApiError } from "../utils/api-error";

export function authorize(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
}
