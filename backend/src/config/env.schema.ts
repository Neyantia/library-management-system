import Joi from 'joi';

export const envValidationSchema = Joi.object({
  // PORT
  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  // DB
  DATABASE_URL: Joi.string().min(1).required(),

  // BOOTSTRAP
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),

  // SESSIONS
  ACTIVE_SESSIONS: Joi.number().integer().min(1).max(20).required(),

  // JWT
  JWT_ISSUER: Joi.string().min(1).required(),
  JWT_AUDIENCE: Joi.string().min(1).required(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL_SECONDS: Joi.number().integer().min(1).required(),

  JWT_REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_TTL_SECONDS: Joi.number().integer().min(1).required(),

  // COOKIES
  COOKIE_SECURE: Joi.boolean().required(),
  COOKIE_SAMESITE: Joi.string().valid('lax', 'strict', 'none').required(),

  // THROTTLE
  THROTTLE_LOGIN_SHORT_LIMIT: Joi.number().integer().min(1).required(),
  THROTTLE_LOGIN_SHORT_TTL_SECONDS: Joi.number().integer().min(1).required(),
  THROTTLE_LOGIN_MEDIUM_LIMIT: Joi.number().integer().min(1).required(),
  THROTTLE_LOGIN_MEDIUM_TTL_MINUTES: Joi.number().integer().min(1).required(),

  THROTTLE_REFRESH_SHORT_LIMIT: Joi.number().integer().min(1).required(),
  THROTTLE_REFRESH_SHORT_TTL_MINUTES: Joi.number().integer().min(1).required(),
  THROTTLE_REFRESH_MEDIUM_LIMIT: Joi.number().integer().min(1).required(),
  THROTTLE_REFRESH_MEDIUM_TTL_MINUTES: Joi.number().integer().min(1).required(),
}).unknown(true);
