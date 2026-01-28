import { body, query } from "express-validator";
import { validate } from "#validator/validate.js";

const emailValidator = validate([]);

const usernameValidator = validate([]);

const passwordValidator = validate([]);

const userLoginValidator = validate([]);

const userRegisterValidator = validate([]);

const changeCurrentPasswordValidator = validate([]);

const resetForgottenPasswordValidator = validate([]);

export {
  emailValidator,
  usernameValidator,
  passwordValidator,
  userLoginValidator,
  userRegisterValidator,
  changeCurrentPasswordValidator,
  resetForgottenPasswordValidator,
};
