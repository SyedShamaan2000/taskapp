const Joi = require("joi");

const email = Joi.string().trim().email().max(254).required();
const password = Joi.string().min(6).max(128).required();

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  email,
  password,
});

const loginSchema = Joi.object({
  email,
  password,
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().min(1).required(),
});

const verifySchema = Joi.object({
  email,
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

const resendVerificationSchema = Joi.object({
  email,
});

const taskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  completed: Joi.boolean(),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(5000),
  completed: Joi.boolean(),
})
  .min(1)
  .unknown(false);

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
    .pattern(/^-?(createdAt|title|completed)(,-?(createdAt|title|completed))*$/)
    .default("-createdAt"),
  completed: Joi.boolean().truthy("1").falsy("0"),
  priority: Joi.string().trim().max(20),
  search: Joi.string().trim().max(100),
});

const taskIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

module.exports = {
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  taskIdSchema,
  taskQuerySchema,
  taskSchema,
  taskUpdateSchema,
  verifySchema,
};
