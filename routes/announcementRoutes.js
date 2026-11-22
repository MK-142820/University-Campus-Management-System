const router = require("express").Router();
const a = require("../controllers/announcementController");
const { protect, allowRoles } = require("../middleware/auth");

router.get("/", protect, a.getAnnouncements);

router.post(
  "/",
  protect,
  allowRoles("Admin", "Faculty"),
  a.createAnnouncement
);

module.exports = router;
