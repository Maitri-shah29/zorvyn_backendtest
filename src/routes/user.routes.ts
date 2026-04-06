import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validators/user.validators";
import { createUser, listUsers, updateUser } from "../services/user.service";

export const userRouter = Router();

userRouter.get(
  "/",
  authorize("readUsers"),
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.status(200).json({ items: users });
  }),
);

userRouter.post(
  "/",
  authorize("manageUsers"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await createUser({
      ...req.body,
      createdById: req.user!.id,
    });

    res.status(201).json(user);
  }),
);

userRouter.patch(
  "/:userId",
  authorize("manageUsers"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await updateUser(String(req.params.userId), req.body);
    res.status(200).json(user);
  }),
);
