const router = require("express").Router();
const a = require("../controllers/attendanceController");
const { protect, allowRoles } = require("../middleware/auth");

router.post(
  "/mark",
  protect,
  allowRoles("Faculty", "Admin"),
  a.markAttendance
);

router.get(
  "/my",
  protect,
  allowRoles("Student"),
  a.myAttendance
);

router.get(
  "/report",
  protect,
  allowRoles("Admin", "Faculty"),
  a.attendanceReport
);

router.get(
  "/low",
  protect,
  allowRoles("Admin", "Faculty"),
  a.lowAttendance
);

module.exports = router;