import type { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { hashPassword } from "../utils/password";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  createdById: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
} satisfies Prisma.UserSelect;

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: publicUserSelect,
  });
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.status,
      createdById: input.createdById,
    },
    select: publicUserSelect,
  });
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const nextRole = input.role ?? existingUser.role;
  const nextStatus = input.status ?? existingUser.status;

  // Protect against system lockout by preserving at least one active admin account.
  if (
    existingUser.role === "ADMIN"
    && existingUser.status === "ACTIVE"
    && (nextRole !== "ADMIN" || nextStatus !== "ACTIVE")
  ) {
    const otherActiveAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
        id: {
          not: userId,
        },
      },
    });

    if (otherActiveAdmins === 0) {
      throw new ApiError(400, "Operation would remove the last active admin");
    }
  }

  const data: Prisma.UserUpdateInput = {
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
  };

  if (input.password) {
    data.passwordHash = await hashPassword(input.password);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });
}
