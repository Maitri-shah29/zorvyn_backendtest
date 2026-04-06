import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { recordRouter } from "./routes/record.routes";
import { dashboardRouter } from "./routes/dashboard.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", authenticate, userRouter);
app.use("/api/records", authenticate, recordRouter);
app.use("/api/dashboard", authenticate, dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
