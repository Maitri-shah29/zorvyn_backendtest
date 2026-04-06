import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { dashboardSummarySchema } from "../validators/dashboard.validators";
import { getDashboardSummary } from "../services/dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  authorize("readDashboard"),
  validate(dashboardSummarySchema),
  asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary({
      startDate: req.query.startDate as Date | undefined,
      endDate: req.query.endDate as Date | undefined,
    });

    res.status(200).json(summary);
  }),
);

dashboardRouter.get(
  "/insights",
  authorize("readInsights"),
  validate(dashboardSummarySchema),
  asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary({
      startDate: req.query.startDate as Date | undefined,
      endDate: req.query.endDate as Date | undefined,
    });

    res.status(200).json({
      categoryTotals: summary.categoryTotals,
      monthlyTrends: summary.monthlyTrends,
      recentActivity: summary.recentActivity,
    });
  }),
);
