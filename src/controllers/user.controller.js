const UserService = require("../services/user.service");

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await UserService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
const changeUserName = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    const userId = req.user.id;
    const result = await UserService.changeUserName(userId, newUsername);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  changePassword,
  changeUserName,
};
