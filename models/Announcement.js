const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: {
    type: String,
    enum: ["University", "Course"],
    default: "University"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", schema);