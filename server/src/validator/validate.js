import { validationResult } from "express-validator";
import { ApiError } from "#util/ApiError.js";

export const validate = (validations) => {
  return async (req, _res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extractedErrors = errors
      .array()
      .map((err) => ({ [err.path]: err.msg }));

    throw ApiError.unprocessableEntity("Received data is not valid", extractedErrors);
  };
};
