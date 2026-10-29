const User = require('./../models/User');
const argon2 = require('argon2');

exports.registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all fields',
      });
    }

    // Email uniqueness check
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Password hashing
    const hashedPassword = await argon2.hash(password);

    // User creation with specific error handling
    try {
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Send verification email
      try {
        await newUser.sendVerificationEmail();
      } catch (emailError) {
        console.error('Email verification sending failed:', emailError);
        // Don't fail registration if email fails, user can resend later
      }

      return res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email to verify your account.',
        userId: newUser._id,
      });
    } catch (error) {
      // Handle specific database errors (e.g., duplicate key errors)
      if (error.code && error.code === 11000) {
        // Common code for duplicate key errors in MongoDB
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists', // More specific message
        });
      } else {
        // Handle other errors
        console.error(error); // Log the actual error for debugging
        return res.status(500).json({
          success: false,
          message: 'An error occurred during registration. Please try again later.',
        });
      }
    }
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
};
