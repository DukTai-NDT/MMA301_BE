const express = require("express");
const CategoryController = require("../controllers/category.controller");
const isAuth = require("../middlewares/isAuth");
const router = express.Router();

//GET /categories/
router.get("/", CategoryController.listCategory);

//POST /categories/
router.post("/", isAuth, CategoryController.createCategory);

//PATCH /categories/{categoryId}/update
router.patch("/:categoryId/update", isAuth, CategoryController.updateCategory);

//DELETE /categories/{categoryId}/delete
router.delete("/:categoryId/delete", isAuth, CategoryController.deleteCategory);

module.exports = router;
