import express from "express";
// import { protect, admin } from "../Middelwares/authMiddleware.js"; // Assuming this exists
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  cancelOrder,
} from "../Controllers/orderController.js";
import {
  validatePlaceOrder,
} from "../Utils/Validation/orderValidation.js";

const router = express.Router();

router.route("/").post(validatePlaceOrder, placeOrder);
router.route("/myorders").get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/deliver").put(updateOrderToDelivered);
router.route("/:id/cancel").put(cancelOrder);

export default router;
