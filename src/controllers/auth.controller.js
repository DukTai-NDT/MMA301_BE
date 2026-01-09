const AuthService = require("../services/auth.service");

const login = async (req, res, next) => {
  try {
    const { user, token } = await AuthService.login(req.body);
    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, phone, password, role } = req.body;
    console.log(req.body);

    const result = await AuthService.register(email, phone, password, role);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  register,
};
