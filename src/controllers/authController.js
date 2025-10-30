const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Thiếu name/email/password/phone" });
    }

    const emailExisted = await User.findOne({ email }).lean();
    if (emailExisted) {
      return res.status(409).json({ message: "Email đã đăng ký." });
    }

    const passHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      passHash,
      roles: ["customer"],
      status: "active",
    });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ message: "Đăng ký thành công", token });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email đã đăng ký." });
    }
    console.error("register error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }
    const ok = await bcrypt.compare(password, user.passHash);
    if (!ok) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    let primaryRole = "customer";
    if (Array.isArray(user.roles)) {
      if (user.roles.includes("admin")) primaryRole = "admin";
      else if (user.roles.includes("owner")) primaryRole = "owner";
      else if (user.roles.includes("customer")) primaryRole = "customer";
      else if (user.roles.length > 0) primaryRole = user.roles[0];
    }

    const userForClient = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: primaryRole,
      roles: user.roles,
    };

    return res.json({
      message: "Đăng nhập thành công",
      token: token,
      user: userForClient,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
