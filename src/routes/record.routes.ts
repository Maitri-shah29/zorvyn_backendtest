import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createRecordSchema,
  listRecordsSchema,
  updateRecordSchema,
} from "../validators/record.validators";
import {
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
} from "../services/record.service";

export const recordRouter = Router();

recordRouter.get(
  "/",
  authorize("readRecords"),
  validate(listRecordsSchema),
  asyncHandler(async (req, res) => {
    const result = await listRecords({
      type: req.query.type as "INCOME" | "EXPENSE" | undefined,
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as Date | undefined,
      endDate: req.query.endDate as Date | undefined,
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
    });

    res.status(200).json(result);
  }),
);

recordRouter.post(
  "/",
  authorize("createRecord"),
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await createRecord({
      ...req.body,
      createdById: req.user!.id,
    });

    res.status(201).json(record);
  }),
);

recordRouter.patch(
  "/:recordId",
  authorize("updateRecord"),
  validate(updateRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await updateRecord(String(req.params.recordId), req.body);
    res.status(200).json(record);
  }),
);

recordRouter.delete(
  "/:recordId",
  authorize("deleteRecord"),
  asyncHandler(async (req, res) => {
    await deleteRecord(String(req.params.recordId));
    res.status(204).send();
  }),
);
