const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { ROLES } = require("../config/iamConfig");
const {
  logSuccessfulAuth,
  logFailedAuth,
  validatePasswordStrength,
} = require("../middlewares/securityAudit");
const {
  loginSchema,
  resetPasswordSchema,
} = require("../lib/validators/authValidators");

const logIn = async (req, res) => {
  try {
    // Validate input using Joi
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const data = await User.findOne({ email });

    if (!data) {
      logFailedAuth(email, "User not found", req);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password", // Generic message for security
      });
    }

    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      logFailedAuth(email, "Invalid password", req);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password", // Generic message for security
      });
    }

    // Log successful authentication
    logSuccessfulAuth(data._id, data.email, data.role, req);

    // Use JWT_SECRET from environment variables (with fallback for backward compatibility)
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_KEY;

    if (!jwtSecret) {
      console.error("❌ JWT secret not configured in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      { email: data.email, id: data._id.toString(), role: data.role },
      jwtSecret,
      { expiresIn: "3d" }
    );

    // Set cookie with appropriate settings for production/cross-domain
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Use secure cookies in production
      sameSite: isProduction ? "none" : "lax", // 'none' for cross-domain in production
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    };

    res.cookie("token", token, cookieOptions);

    console.log("🍪 Cookie set with options:", cookieOptions);

    console.log(`✅ User logged in: ${data.email} (Role: ${data.role})`);

    if (!data.passwordChanged) {
      return res.status(200).json({
        success: true,
        resetPassword: true,
        message: "Please reset your password.",
        user: {
          _id: data._id,
          email: data.email,
          role: data.role,
          permissions: ROLES[data.role] || [],
          profileSetup: data.profileSetup,
          passwordChanged: data.passwordChanged,
        },
      });
    }

    return res.status(200).json({
      success: true,
      token: token, // Include token for frontend storage
      user: {
        _id: data._id,
        email: data.email,
        role: data.role,
        permissions: ROLES[data.role] || [],
        profileSetup: data.profileSetup,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
        color: data.color,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    // Add console log to debug the user ID
    console.log("User ID from middleware: ", req.id);

    const user = await User.findById(req.id);
    if (!user) {
      console.log("No user found with ID:", req.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        permissions: ROLES[user.role] || [],
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (err) {
    console.error("Error in getUserInfo:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logOut = async (req, res) => {
  try {
    // Log the current cookie before clearing
    console.log(
      "🍪 Current cookie before logout:",
      req.cookies?.token ? "Present" : "Not found"
    );

    // Clear cookie with the same attributes used when setting it
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.clearCookie("token", cookieOptions);

    // Also try clearing without specifying attributes (fallback)
    res.clearCookie("token");

    console.log("✅ User logged out successfully - cookie cleared");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

const githubAuth = (req, res) => {
  const baseUrl = process.env.SERVER_URL || "http://localhost:4000";
  const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/github/callback`);
  const clientId = process.env.GITHUB_CLIENT_ID;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(githubUrl);
};

// Step 2: Handle GitHub OAuth callback
const githubCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Get user info from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${accessToken}` },
    });

    // Prefer primary email
    const emailObj = emailRes.data.find((e) => e.primary) || emailRes.data[0];
    const email = emailObj.email;

    // Find or create user in your DB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: "", // Empty password for OAuth users
        githubId: userRes.data.id,
        role: "user",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie with proper cross-domain settings
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    // Redirect to your frontend app with token in URL for cross-domain auth
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth?token=${token}&success=true`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    res.status(500).json({ error: "GitHub OAuth failed" });
  }
};

const linkedinAuth = (req, res) => {
  const baseUrl = process.env.SERVER_URL || "http://localhost:4000";
  const redirectUri = encodeURIComponent(
    `${baseUrl}/api/auth/linkedin/callback`
  );
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const state = "randomstatestring";
  const scope = "openid profile email";
  const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${encodeURIComponent(
    scope
  )}`;
  res.redirect(linkedinUrl);
};

const linkedinCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error("No code in callback!");
    return res.status(400).send("No code provided in callback.");
  }

  const baseUrl = process.env.SERVER_URL || "http://localhost:4000";
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;
  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Fetch user profile
    const userInfo = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const email = userInfo.data.email;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: "", // Empty password for OAuth users
        linkedinId: userInfo.data.sub,
        role: "user",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // Set cookie with proper cross-domain settings
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    // Redirect to your frontend app with token in URL for cross-domain auth
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth?token=${token}&success=true`);
  } catch (err) {
    console.error(
      "LinkedIn OAuth error:",
      err.response?.data || err.message || err
    );
    res.status(500).json({
      error: "LinkedIn OAuth failed",
      details: err.response?.data || err.message || err,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Validate input using Joi
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { userId, newPassword } = req.body;

    // Validate password strength (keep existing check as it might be more complex than Joi regex)
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    user.passwordChanged = true;
    await user.save();

    // Log password change for security audit
    logSuccessfulAuth(user._id, user.email, "PASSWORD_RESET", req);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during password reset",
    });
  }
};

module.exports = {
  logIn,
  getUserInfo,
  logOut,
  githubAuth,
  githubCallback,
  linkedinAuth,
  linkedinCallback,
  resetPassword,
};
