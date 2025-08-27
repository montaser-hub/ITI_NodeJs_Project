import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory, getCategory } from "../Controllers/categoryController.js";
const categoriesRouter = express.Router();





categoriesRouter.route("/").get(getCategories).post( createCategory);
categoriesRouter.route("/:id").get( getCategory).put(  updateCategory).delete( deleteCategory);

export default categoriesRouter;