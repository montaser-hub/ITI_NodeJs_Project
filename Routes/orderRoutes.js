import express from "express";
import { protect, restrictTo } from "../Controllers/authController.js";
import {
  placeOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderToDelivered,
  cancelOrder,
  getOrderByPaypalId,
} from "../Controllers/orderController.js";
import { validateOrderSchema } from "../Utils/Validation/orderValidation.js";
import validationMiddleware from "../Middelwares/validation.js";

const router = express.Router();

router
  .route("/")
  .post(protect, validationMiddleware(validateOrderSchema), placeOrder)
  .get(protect, restrictTo("admin"), getOrders);

router.route("/myorders").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderById);

router
  .route("/:id/deliver")
  .put(protect, restrictTo("admin"), updateOrderToDelivered);
router.route("/:id/cancel").put(protect, cancelOrder);

router.get("/paypal/:paypalOrderId", protect, getOrderByPaypalId);

export default router;
