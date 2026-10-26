const User = require('./../models/User');

// Middleware to check if user is authenticated (exists in DB)
// This is a common dependency for all protected routes

exports.authenticate = async (req, res, next) => {
    try {
        // Extract userId from various sources
        const userId = req.body?.userId || 
                       req.query?.userId || 
                       req.headers['user-id'] ||
                       (req.body?.email && { _id: req.body.email }); // Temporary hack for login

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required: user ID not found',
            });
        }

        // Get user from database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};

// Combined middleware: authenticated AND verified
exports.requireVerifiedUserAndAuthenticated = async (req, res, next) => {
    try {
        // First, authenticate
        await exports.authenticate(req, res, async () => {
            // Then, check if verified
            if (!req.user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Email is not verified. Please verify your email before accessing this application.',
                });
            }
            // User is both authenticated and verified
            next();
        });
    } catch (error) {
        console.error('Combined middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication and verification error',
        });
    }
};