const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

router.post("/", requireAuth, upload.single("file"), uploadController.upload);

module.exports = router;
