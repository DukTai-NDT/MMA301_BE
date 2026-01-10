const CategoryService = require("../services/category.service");

const listCategory = async (req, res, next) => {
  try {
    const result = await CategoryService.listCategory();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
const createCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    const result = await CategoryService.createCategory(userId, data);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};
const updateCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const categoryId = req.params.categoryId;
    const userId = req.user.id;
    const result = await CategoryService.updateCategory(
      userId,
      categoryId,
      data
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
const deleteCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.categoryId;
    const result = await CategoryService.deleteCategory(userId, categoryId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  listCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
