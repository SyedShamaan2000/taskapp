const User = require("./../models/User");
const argon2 = require("argon2");

exports.loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all the fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not registered",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified.",
      })
    }

    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    delete user.password;

    return res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
      user,
    });
  } catch (error) {
    console.error(error);

    // Categorize errors and provide specific messages
    if (error.name === "MongoError") {
      return res.status(500).json({
        success: false,
        message: "Database error, please try again later.",
      });
    } else if (error.message.includes("Validation failed")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    } else {
      // Handle other unexpected errors
      return res.status(500).json({
        success: false,
        message: "Internal server error, please try again later.",
      });
    }
  }
};
