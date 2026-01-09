const { User } = require("../models");
const { signAccessToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");
const { Op } = require("sequelize");

const httpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw httpError("The user does not found.", 404);
  }
  const isMatchOld = await comparePassword(oldPassword, user.password_hash);
  if (!isMatchOld) {
    throw httpError("The old password is incorrect.", 400);
  }
  const isMatchNew = await comparePassword(newPassword, user.password_hash);
  if (isMatchNew) {
    throw httpError(
      "The new password must be different from the old password.",
      400
    );
  }
  const hashPass = await hashPassword(newPassword);
  user.password_hash = hashPass;
  user.updated_at = new Date();
  const updateUser = await user.save();
  return updateUser;
};
const changeUserName = async (userId, newUserName) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw httpError("The user does not found.", 404);
  }
  const invalidUsernameUser = await User.findOne({
    where: { username: newUserName },
  });
  if (invalidUsernameUser) {
    throw httpError("The username already exists.", 400);
  }
  user.username = newUserName;
  await user.save();
  return user;
};

module.exports = { changePassword, changeUserName };
