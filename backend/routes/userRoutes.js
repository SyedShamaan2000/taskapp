const express = require("express");
const { registerController } = require("./../controllers/registerController");
const { loginController } = require("./../controllers/loginController");
const validate = require("../middleware/validate");
const {
  loginSchema,
  refreshSchema,
  registerSchema,
} = require("../utils/validators");
const { verifyRefreshToken, signAccessToken } = require("./../utils/jwt");

const router = express.Router();

router.post("/register", validate(registerSchema, "body"), registerController);
router.post("/login", validate(loginSchema, "body"), loginController);

router.post("/refresh", validate(refreshSchema, "body"), (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: decoded.userId || decoded.id || decoded.sub });
    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
});

module.exports = router;
