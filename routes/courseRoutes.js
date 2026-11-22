const router = require("express").Router();
const c = require("../controllers/courseController");
const { protect, allowRoles } = require("../middleware/auth");

router.get("/", protect, c.getCourses);

router.post("/", protect, allowRoles("Admin"), c.createCourse);
router.patch("/:id", protect, allowRoles("Admin"), c.updateCourse);
router.delete("/:id", protect, allowRoles("Admin"), c.deleteCourse);

router.post("/sections", protect, allowRoles("Admin"), c.createSection);
router.post("/enroll", protect, allowRoles("Student"), c.enrollStudent);
router.get("/my-courses", protect, allowRoles("Student"), c.myCourses);

module.exports = router;