const User = require("../models/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and password (8+ characters) required"
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Student"
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

exports.logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    refreshToken: null
  });

  res.json({ message: "Logged out successfully" });
};