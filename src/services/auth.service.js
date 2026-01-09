const { User } = require("../models");
const { signAccessToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");
const { Op } = require("sequelize");

const httpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const generateUsername = async (email) => {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  let username;
  let exists = true;

  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000);
    username = base + random;

    const user = await User.findOne({ where: { username } });
    exists = !!user;
  }

  return username;
};

const login = async ({ login_key, password }) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: login_key },
        { phone: login_key },
        { username: login_key },
      ],
    },
  });

  if (!user) {
    throw httpError("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw httpError("Invalid credentials");
  }

  const payload = {
    sub: user.id,
    role: user.role,
  };

  const token = signAccessToken(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
};
const register = async (email, phone, password, role) => {
  console.log(`email : ${email}, p : ${phone}, p: ${password}, r: ${role}`);

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: email }, { phone: phone }],
    },
  });
  if (user) {
    throw httpError("User is existed", 400);
  }
  const hashPass = await hashPassword(password);
  const generUsername = await generateUsername(email);
  const newUser = await User.create({
    email: email,
    phone: phone,
    username: generUsername,
    password_hash: hashPass,
    role: role,
  });
  return newUser;
};

module.exports = { login, register };
