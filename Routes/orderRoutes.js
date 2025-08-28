import express from "express";
import { protect, restrictTo } from "../Controllers/authController.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  cancelOrder,
} from "../Controllers/orderController.js";
import { validateOrderSchema } from "../Utils/Validation/orderValidation.js";
import validationMiddleware from "../Middelwares/validation.js";

const router = express.Router();

router
  .route("/")
  .post(protect, validationMiddleware(validateOrderSchema), placeOrder);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderById);
router
  .route("/:id/deliver")
  .put(protect, restrictTo("admin"), updateOrderToDelivered);
router.route("/:id/cancel").put(protect, cancelOrder);

export default router;
