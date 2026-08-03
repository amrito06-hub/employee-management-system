const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("========== AUTH DEBUG ==========");
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    req.admin = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR NAME:", error.name);
    console.log("JWT ERROR MESSAGE:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authMiddleware;