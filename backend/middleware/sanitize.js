const xss = require("xss");
const unsanitizedFields = new Set(["email", "otp", "password", "refreshToken"]);

const sanitizeValue = (value, key) => {
  if (unsanitizedFields.has(key)) {
    return value;
  }

  if (typeof value === "string") {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map((nestedValue) => sanitizeValue(nestedValue));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeValue(nestedValue, key),
      ]),
    );
  }

  return value;
};

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = sanitizeBody;
