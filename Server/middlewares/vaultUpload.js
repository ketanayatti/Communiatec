const multer = require('multer');

// Use memory storage so we can directly send buffer to Cloudinary (no tmp file writes)
const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

// Accept common document / archive types
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  // Plain text
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  // Allow all supported types plus some additional common formats
  const isAllowed =
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("text/") ||
    file.mimetype.includes("json") ||
    file.mimetype.includes("xml");

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`)); // More descriptive error
  }
};

module.exports = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});