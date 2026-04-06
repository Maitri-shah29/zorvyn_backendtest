import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validators";
import { login } from "../services/auth.service";

export const authRouter = Router();

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await login(req.body.email, req.body.password);

    res.status(200).json(result);
  }),
);
