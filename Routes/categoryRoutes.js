import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, getCategory } from "../Controllers/categoryController.js";
import { protect, restrictTo } from "../Controllers/authController.js";
import validationMiddleware from "../Middelwares/validation.js";
import { categoryValidationSchema } from "../Utils/Validation/categoryValidation.js"; // import categoryValidationSchema from "../Utils/Validation/categoryValidation.js"; 
const categoriesRouter = express.Router();





categoriesRouter.route("/").get(protect, restrictTo("admin", "user"), getCategories).post(protect, restrictTo("admin"), validationMiddleware(categoryValidationSchema),createCategory);
categoriesRouter.route("/:id").get(protect, restrictTo("admin"), getCategory).put(protect, restrictTo("admin"),validationMiddleware(categoryValidationSchema), updateCategory).delete(protect, restrictTo("admin"), deleteCategory);

export default categoriesRouter;