const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router.use(requireAuth);

router.get("/", reportController.list);
router.get("/:id", reportController.getOne);
router.put("/:id", reportController.update);
router.delete("/:id", reportController.remove);

module.exports = router;
