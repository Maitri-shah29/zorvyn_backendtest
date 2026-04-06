import type { NextFunction, Request, Response } from "express";
import { UserStatus } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/api-error";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization token"));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);

    if (payload.status !== UserStatus.ACTIVE) {
      return next(new ApiError(403, "Inactive users cannot access this resource"));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authorization token"));
  }
}
