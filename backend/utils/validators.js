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

// Shared enums matching backend/models/Task.js (status-only; no completed boolean).
const taskStatus = Joi.string().valid("pending", "in-progress", "completed");
const taskPriority = Joi.string().valid("low", "medium", "high", "urgent");
const taskTags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(20);
const taskDueDate = Joi.date().iso().allow(null);

const taskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  status: taskStatus.default("pending"),
  priority: taskPriority.default("medium"),
  dueDate: taskDueDate,
  tags: taskTags.default([]),
}).unknown(false);

const taskUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(5000),
  status: taskStatus,
  priority: taskPriority,
  dueDate: taskDueDate,
  tags: taskTags,
})
  .min(1)
  .unknown(false);

const SORT_FIELDS = "createdAt|updatedAt|title|status|priority|dueDate";

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
    .pattern(new RegExp(`^-?(${SORT_FIELDS})(,-?(${SORT_FIELDS}))*$`))
    .default("-createdAt"),
  status: taskStatus,
  priority: taskPriority,
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
