const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }

    const token = header.split(" ")[1];

    req.user = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    next();
  };
}

module.exports = { protect, allowRoles };