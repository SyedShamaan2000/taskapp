require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const { csrfProtection, issueCsrfToken } = require("./middleware/csrf");
const sanitizeBody = require("./middleware/sanitize");
const { apiLimiter, authLimiter } = require("./middleware/rateLimit");

const app = express();
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
}
app.set("trust proxy", trustProxyHops);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
  }),
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "CSRF-Token"],
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use(csrfProtection);

app.get("/csrf-token", apiLimiter, issueCsrfToken);

app.get("/", (req, res) => {
  res.send("Welcome to Task Management App - TaskTrackr");
});

app.use("/auth", authLimiter, userRoutes);
app.use("/verify", apiLimiter, verifyRoutes);
app.use("/tasks", apiLimiter, taskRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request",
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
