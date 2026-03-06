import Joi from "joi";

/** Avoid magic numbers (Sonar rule) */
const NAME_MIN = 2;
const NAME_MAX = 100;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 50;

const DEVICE_TYPES = [1, 2]; // 1 = iOS, 2 = Android/Web

/** Common fields */
const emailField = Joi.string()
  .email()
  .trim()
  .lowercase()
  .required();

const passwordField = Joi.string()
  .min(PASSWORD_MIN)
  .max(PASSWORD_MAX)
  .trim()
  .required();

const deviceTypeField = Joi.number()
  .valid(...DEVICE_TYPES)
  .default(null);

const deviceTokenField = Joi.string()
  .trim()
  .allow("")
  .default(null);

const timeZoneField = Joi.string()
  .trim()
  .max(100)
  .default(null);

/**
 * Signup Schema
 */
export const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(NAME_MIN)
    .max(NAME_MAX)
    .required(),

  email: emailField,
  password: passwordField,
  device_type: deviceTypeField,
  device_token: deviceTokenField,
  time_zone: timeZoneField,
})
  .unknown(false); // reject extra fields

/**
 * Signin Schema
 */
export const signinSchema = Joi.object({
  email: emailField,
  password: Joi.string().trim().required(),
  device_type: deviceTypeField,
  device_token: deviceTokenField,
})
  .unknown(false);


  export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

export const supportSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(5).max(1000).required()
});