const course = require("../models/course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");

exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("faculty", "name email")
      .limit(100);

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ message: "Course deleted" });
  } catch (error) {
    next(error);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
};

exports.enrollStudent = async (req, res, next) => {
  try {
    const { courseId, sectionId } = req.body;

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      section: sectionId
    });

    res.status(201).json({
      message: "Enrollment successful",
      enrollment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already enrolled" });
    }
    next(error);
  }
};

exports.myCourses = async (req, res, next) => {
  try {
    const data = await Enrollment.find({ student: req.user.id })
      .populate("course")
      .populate("section");

    res.json(data);
  } catch (error) {
    next(error);
  }
};

