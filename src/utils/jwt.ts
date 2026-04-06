import jwt from "jsonwebtoken";
import type { Role, UserStatus } from "@prisma/client";
import { env } from "../config/env";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
