const { User } = require("../models");
const { signAccessToken } = require("../utils/jwt");
const { comparePassword } = require("../utils/password");
const { Op } = require("sequelize");

const httpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

module.exports = { login };
