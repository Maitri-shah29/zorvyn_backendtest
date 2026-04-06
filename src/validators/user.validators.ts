import { Role, UserStatus } from "@prisma/client";
import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  role: z.enum(Role),
  status: z.enum(UserStatus).default(UserStatus.ACTIVE),
});

export const createUserSchema = z.object({
  body: baseUserSchema.extend({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateUserSchema = z.object({
  body: baseUserSchema
    .extend({
      password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[0-9]/, "Password must include at least one number")
        .optional(),
    })
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "At least one field must be provided",
    }),
  params: z.object({
    userId: z.string().min(1),
  }),
  query: z.object({}).default({}),
});
