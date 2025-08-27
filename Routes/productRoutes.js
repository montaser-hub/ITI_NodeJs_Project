import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controllers/productController.js";
import { validationMiddleware } from "../Middelwares/validationProMiddelware.js";
import { isAuth, isAdmin } from "../middleware/auth.js";

const productRouter = express.Router();

// GET all products (with pagination)
// POST create new product (admin only)
productRouter
  .route("/product")
  .get(getProducts)
  .post(isAuth, isAdmin, validationMiddleware, createProduct);

// GET single product by id
// PUT update product (admin only)
// DELETE delete product (admin only)
productRouter
  .route("/product/:id")
  .get(getProductById)
  .put(isAuth, isAdmin, validationMiddleware, updateProduct)
  .delete(isAuth, isAdmin, deleteProduct);

export default productRouter;
