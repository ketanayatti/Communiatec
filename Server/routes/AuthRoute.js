const express = require("express");
const router = express.Router();
const {
  logIn,
  getUserInfo,
  logOut,
  githubAuth,
  githubCallback,
  linkedinAuth,
  linkedinCallback,
  resetPassword,
} = require("../controllers/AuthController.js");
const verifyToken = require("../middlewares/AuthMiddleware.js");

router.post("/login", logIn);
router.post("/reset-password", resetPassword);

// 🔧 FIX: Make userInfo route handle both authenticated and unauthenticated states
router.get("/userInfo", (req, res, next) => {
  // Check if there's a token in cookies or authorization header
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : null;
  
  // If no token is present, return 401 without going through middleware
  if (!cookieToken && !bearerToken) {
    return res.status(401).json({
      success: false,
      message: "No authentication token provided",
    });
  }
  
  // If token exists, verify it through middleware
  verifyToken(req, res, next);
}, getUserInfo);

router.post("/logout", logOut);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);
router.get("/linkedin", linkedinAuth);
router.get("/linkedin/callback", linkedinCallback);

module.exports = router;