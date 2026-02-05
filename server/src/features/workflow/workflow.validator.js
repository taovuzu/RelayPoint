import { body } from "express-validator";
import { validate } from "#validator/validate.js";

export const validateCreateWorkflow = validate([
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be between 3 and 100 characters"),
  body("description")
    .optional()
    .isString().withMessage("Description must be a string"),
  body("trigger")
    .isObject().withMessage("Trigger must be an object"),
  body("trigger.id")
    .notEmpty().withMessage("Trigger ID is required")
    .isString().withMessage("Trigger ID must be a string"),
  body("actions")
    .isArray({ min: 1 }).withMessage("Actions must be a non-empty array"),
  body("actions.*.id")
    .notEmpty().withMessage("Action ID is required")
    .isString().withMessage("Action ID must be a string"),
  body("actions.*.order")
    .isInt({ min: 0 }).withMessage("Action order must be a non-negative integer"),
  body("actions.*.config")
    .isObject().withMessage("Action config must be an object")
]);

export const validateUpdateWorkflow = validate([
  body("name")
    .optional()
    .trim()
    .isString().withMessage("Name must be a string")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be between 3 and 100 characters"),
  body("description")
    .optional()
    .isString().withMessage("Description must be a string"),
  body("trigger")
    .optional()
    .isObject().withMessage("Trigger must be an object"),
  body("trigger.id")
    .optional()
    .isString().withMessage("Trigger ID must be a string"),
  body("actions")
    .optional()
    .isArray({ min: 1 }).withMessage("Actions must be a non-empty array"),
  body("actions.*.id")
    .optional()
    .isString().withMessage("Action ID must be a string"),
  body("actions.*.order")
    .optional()
    .isInt({ min: 0 }).withMessage("Action order must be a non-negative integer"),
  body("actions.*.config")
    .optional()
    .isObject().withMessage("Action config must be an object")
]);

// ref: https://express-validator.github.io/docs/guides/getting-started
