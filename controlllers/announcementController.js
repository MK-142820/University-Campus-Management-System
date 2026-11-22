const Announcement = require("../models/Announcement");
const eventService = require("../services/eventService");

exports.createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user.id
    });

    eventService.emit("announcementCreated", announcement);

    res.status(201).json({
      message: "Announcement created",
      announcement
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};