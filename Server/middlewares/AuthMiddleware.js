const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get token from cookie or Authorization header
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  
  const token = cookieToken || headerToken;

  if (!token) {
    // 🔧 FIX: Don't log this as an error - it's expected for logged out users
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      code: "NO_TOKEN"
    });
  }

  try {
    // Verify the token using the JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY;
    
    if (!jwtSecret) {
      console.error("❌ JWT secret not configured in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
        code: "JWT_SECRET_MISSING"
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach user info to request object
    req.id = decoded.id;
    req.email = decoded.email;
    req.role = decoded.role;
    req.user = { 
      id: decoded.id, 
      email: decoded.email, 
      role: decoded.role 
    };
    
    // 🔧 FIX: Only log successful authentications for userInfo to reduce noise
    if (!req.originalUrl.includes('/auth/userInfo')) {
      console.log(`🔐 Token verified for user: ${decoded.email} (Role: ${decoded.role})`);
    }
    
    next();
  } catch (error) {
    // 🔧 FIX: Don't log token errors for userInfo endpoint - they're expected
    if (!req.originalUrl.includes('/auth/userInfo')) {
      console.error("❌ Token verification failed:", error.message);
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
        code: "TOKEN_EXPIRED",
        expired: true
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        code: "INVALID_TOKEN"
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Token verification failed.",
        code: "VERIFICATION_FAILED"
      });
    }
  }
};

module.exports = verifyToken;