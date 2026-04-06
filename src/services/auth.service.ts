import { UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { comparePassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(403, "Inactive users cannot log in");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}
