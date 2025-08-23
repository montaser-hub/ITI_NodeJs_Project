import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, getCategory } from "../Controllers/categoryController.js";
import { validateCategory, isValidId , validateId} from "../Middelwares/categoryMiddleWare.js";
const categoriesRouter = express.Router();



// Middleware to handle validation results
const validate = (req, res, next) => {
  next(); // Placeholder for Joi validation results (handled in validateCategory)
};

categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:id", validateId, getCategory);
categoriesRouter.post("/", validateCategory, validate, createCategory);
categoriesRouter.put("/:id", validateId, validateCategory, validate, updateCategory);
categoriesRouter.delete("/:id", validateId, deleteCategory);

export default categoriesRouter;