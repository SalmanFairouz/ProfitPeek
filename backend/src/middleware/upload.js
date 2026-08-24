const multer = require("multer");

const MAX_FILE_BYTES = 15 * 1024 * 1024;

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF files are accepted"));
    }
    cb(null, true);
  },
});
