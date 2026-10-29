const User = require('./../models/User');

// Middleware to check if user is verified by email
// Usage: app.use('/tasks', authenticate, requireVerifiedUser, taskRoutes)

exports.requireVerifiedUser = async (req, res, next) => {
  try {
    // Extract userId from body, query params, or headers
    const userId = req.body?.userId || req.query?.userId || req.headers['user-id'];
    const userObjectId = userId;

    if (!userObjectId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userObjectId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email is not verified. Please verify your email before proceeding.',
      });
    }

    // Attach user to request for downstream handlers
    req.user = user;

    next();
  } catch (error) {
    console.error('Verification middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying user status',
    });
  }
};

// Middleware to optionally check verified status (doesn't block)
exports.optionalVerifyUser = async (req, res, next) => {
  try {
    const userId = req.body?.userId || req.query?.userId || req.headers['user-id'];
    const userObjectId = userId;

    if (userObjectId) {
      const user = await User.findById(userObjectId);
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user context for optional checks
    next();
  }
};
