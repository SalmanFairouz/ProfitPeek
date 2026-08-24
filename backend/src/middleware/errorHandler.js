const multer = require("multer");

module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "PDF is too large (max 15MB)" : err.message;
    return res.status(400).json({ error: message });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
};
