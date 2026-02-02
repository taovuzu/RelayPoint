import { body } from "express-validator";
import { validate } from "#validator/validate.js";
import { SERVICES } from "#constant.js";

export const validateCreateConnection = validate([
  body("service")
    .isIn(Object.values(SERVICES))
    .withMessage(
      `service must be one of: ${Object.values(SERVICES).join(", ")}`
    ),
  body("connectionId")
    .isString()
    .withMessage("connectionId must be a string")
    .notEmpty()
    .withMessage("connectionId cannot be empty"),

  body("accountIdentifier")
    .optional()
    .isString()
    .withMessage("accountIdentifier must be a string"),
]);

// ref: https://express-validator.github.io/docs/guides/getting-started
