const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
const eventService = require("./services/eventService");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusConnect Backend is Running"
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is working" });
});

// EventEmitter -> Socket.IO
eventService.on("announcementCreated", (announcement) => {
  io.emit("newAnnouncement", announcement);
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${5000}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });