const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/AuthMiddleware');
const {
  uploadLimiter,
  validateFileUpload,
} = require("../middlewares/securityMiddleware");
const {
  updateProfile,
  uploadImage,
  deleteImage,
} = require("../controllers/profileController");
const upload = require("../middlewares/upload");

router.post("/update-profile", verifyToken, updateProfile);
router.post(
  "/upload-image",
  verifyToken,
  uploadLimiter, // Rate limit file uploads
  upload.single("profile-image"),
  validateFileUpload, // Additional security validation
  uploadImage
);
router.post('/delete-image', verifyToken, deleteImage);
module.exports = router;