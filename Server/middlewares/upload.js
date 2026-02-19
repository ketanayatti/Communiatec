const multer = require('multer');
const path = require("path");

const storage = multer.memoryStorage();

// Enhanced file validation for profile images
const fileFilter = (req, file, cb) => {
  // Only allow image files for profile uploads
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Validate both MIME type and extension
  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    // Additional security: check for double extensions and suspicious patterns
    const filename = file.originalname.toLowerCase();
    const suspiciousPatterns = [
      /\.php/i,
      /\.asp/i,
      /\.jsp/i,
      /\.exe/i,
      /\.sh/i,
      /\.bat/i,
      /\.cmd/i,
    ];

    const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
      pattern.test(filename)
    );
    if (hasSuspiciousPattern) {
      return cb(new Error("File type not allowed for security reasons"));
    }

    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only images are allowed. Received: ${file.mimetype}`
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
    files: 1, // Only one file per upload
  },
  fileFilter: fileFilter,
});

module.exports = upload;