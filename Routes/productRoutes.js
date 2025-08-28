import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controllers/productController.js";
import validationMiddleware  from "../Middelwares/validation.js";
import productValidationSchema from "../Utils/Validation/productValidation.js";
import { protect , restrictTo } from "../Controllers/authController.js " ;

const productRouter = express.Router();


productRouter
  .route("/products")
  .get(protect , getProducts)
  .post(protect, restrictTo("admin"), validationMiddleware(productValidationSchema), createProduct);


productRouter
  .route("/products/:id")
  .get(protect , getProductById)
  .put(protect, restrictTo("admin"), validationMiddleware(productValidationSchema), updateProduct)
  .delete(protect, restrictTo("admin"), deleteProduct);

export default productRouter;
