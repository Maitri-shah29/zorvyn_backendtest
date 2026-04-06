import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error";

type RequestShape = {
  body: unknown;
  params: unknown;
  query: unknown;
};

export function validate(schema: ZodType<RequestShape>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(
        new ApiError(400, "Validation failed", result.error.flatten()),
      );
    }

    req.body = result.data.body;
    req.params = result.data.params as Request["params"];
    // Express 5 exposes req.query via a getter, so mutate the object instead of reassigning.
    Object.assign(
      req.query as Record<string, unknown>,
      result.data.query as Record<string, unknown>,
    );

    return next();
  };
}
