import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, getCategory } from "../Controllers/categoryController.js";
import { validateCategory,  validateId } from "../Middelwares/categoryMiddleWare.js";
const categoriesRouter = express.Router();



// Middleware to handle validation results
// const validate = (req, res, next) => {
//     next(); // Placeholder for Joi validation results (handled in validateCategory)
// };

categoriesRouter.route("/").get(getCategories).post(validateCategory,  createCategory);
categoriesRouter.route("/:id").get(validateId, getCategory).put(validateId, validateCategory,  updateCategory).delete(validateId, deleteCategory);

export default categoriesRouter;