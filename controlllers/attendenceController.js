const Attendance = require("../models/Attendance");
const course = require("../models/course");

exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    if (!studentId || !courseId || !date ||
        !["Present", "Absent"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.faculty) !== req.user.id &&
        req.user.role !== "Admin") {
      return res.status(403).json({
        message: "You are not assigned to this course"
      });
    }

    const record = await Attendance.create({
      student: studentId,
      course: courseId,
      date: new Date(date),
      status
    });

    res.status(201).json({
      message: "Attendance marked",
      record
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already marked for this session"
      });
    }
    next(error);
  }
};

exports.myAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({
      student: req.user.id
    }).populate("course", "title code");

    res.json(records);
  } catch (error) {
    next(error);
  }
};

exports.attendanceReport = async (req, res, next) => {
  try {
    const report = await Attendance.aggregate([
      {
        $group: {
          _id: {
            student: "$student",
            course: "$course"
          },
          totalClasses: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          student: "$_id.student",
          course: "$_id.course",
          totalClasses: 1,
          attended: 1,
          percentage: {
            $multiply: [
              { $divide: ["$attended", "$totalClasses"] },
              100
            ]
          }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.lowAttendance = async (req, res, next) => {
  try {
    const report = await Attendance.aggregate([
      {
        $group: {
          _id: {
            student: "$student",
            course: "$course"
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          student: "$_id.student",
          course: "$_id.course",
          percentage: {
            $multiply: [{ $divide: ["$present", "$total"] }, 100]
          }
        }
      },
      { $match: { percentage: { $lt: 75 } } }
    ]);

    res.json(report);
  } catch (error) {
    next(error);
  }
};