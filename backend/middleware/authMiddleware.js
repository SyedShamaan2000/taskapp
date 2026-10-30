const { verifyAccessToken } = require("./../utils/jwt")

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["Authorization"]
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required: access token missing",
      })
    }

    const decoded = verifyAccessToken(token)
    req.userId = decoded.userId || decoded.id || decoded.sub
    req.user = { _id: req.userId }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    })
  }
}

exports.requireVerifiedUserAndAuthenticated = async (req, res, next) => {
  try {
    await exports.authenticate(req, res, async () => {
      const User = require("./../models/User")
      const user = await User.findById(req.userId)
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      }
      req.user = user
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Email is not verified. Please verify your email before accessing this application.",
        })
      }
      next()
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authentication error" })
  }
}
