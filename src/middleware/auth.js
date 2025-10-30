const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Authenticate JWT and attach user document to req.user
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);

    // payload.sub holds user id (as string) according to authController
    const userId = payload.sub;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Unauthorized: invalid token payload" });

    const user = await User.findById(userId).select("-passHash");
    if (!user)
      return res.status(401).json({ message: "Unauthorized: user not found" });

    req.user = user;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized: invalid or expired token" });
  }
}

// checkRole('owner', 'admin') => middleware
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];

    // admin always allowed (override)
    if (userRoles.includes("admin")) return next();

    const allowed = allowedRoles.some((r) => userRoles.includes(r));
    if (allowed) return next();

    return res.status(403).json({ message: "Forbidden: insufficient role" });
  };
}

module.exports = {
  authenticate,
  checkRole,
};
