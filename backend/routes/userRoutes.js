const express = require("express");
const { registerController } = require("./../controllers/registerController");
const { loginController } = require("./../controllers/loginController");

const router = express.Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);

module.exports = router;
const { verifyRefreshToken, signAccessToken } = require('./../utils/jwt');

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token required" });
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: decoded.userId || decoded.id || decoded.sub });
    return res.status(200).json({ success: true, accessToken });
  } catch (e) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
});
