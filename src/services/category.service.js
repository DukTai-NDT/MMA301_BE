const { User, Category } = require("../models");
const { Op } = require("sequelize");

const httpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const listCategory = async () => {
  const categories = await Category.findAll();
  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
  }));
  return result;
};
const createCategory = async (userId, data) => {
  const { name, description } = data;
  const user = await User.findByPk(userId);
  if (user.role != "admin") {
    throw httpError(
      "Only administrators have the right to add a category.",
      400
    );
  }
  if (!name || name.trim() === "") {
    throw httpError("Category name must not be empty.", 400);
  }
  if (!description || description.trim() === "") {
    throw httpError("Category description must not be empty.", 400);
  }
  const newCategory = await Category.create({
    name: name,
    description: description,
  });
  return newCategory;
};
const updateCategory = async (userId, categoryId, data) => {
  const { name, description } = data;

  const user = await User.findByPk(userId);
  if (!user || user.role !== "admin") {
    throw httpError(
      "Only administrators have the right to update a category.",
      403
    );
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw httpError("Category not found.", 404);
  }

  // nếu truyền name nhưng rỗng -> lỗi
  if (name !== undefined) {
    if (name.trim() === "") {
      throw httpError("Category name must not be empty.", 400);
    }
    category.name = name;
  }

  // nếu truyền description nhưng rỗng -> lỗi
  if (description !== undefined) {
    if (description.trim() === "") {
      throw httpError("Category description must not be empty.", 400);
    }
    category.description = description;
  }

  const updatedCategory = await category.save();
  return updatedCategory;
};
const deleteCategory = async (userId, categoryId) => {
  const user = await User.findByPk(userId);
  if (!user || user.role !== "admin") {
    throw httpError(
      "Only administrators have the right to delete a category.",
      403
    );
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw httpError("Category not found.", 404);
  }

  await category.destroy();

  return true;
};
module.exports = {
  listCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
