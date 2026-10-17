const express = require("express");
const { registerController } = require("./../controllers/registerController");
const { loginController } = require("./../controllers/loginController");

const router = express.Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);

module.exports = router;
