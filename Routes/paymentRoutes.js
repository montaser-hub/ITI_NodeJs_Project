import express from "express";
import { protect } from "../Controllers/authController.js"; // Assuming this exists

import {
  paypalWebhook,
  createPayPalPayment,
} from "../Controllers/paymentsController.js";

const router = express.Router();

// PayPal Routes
router.post("/paypal/webhook", express.json(), paypalWebhook);
router.post("/paypal/:orderId", protect, createPayPalPayment);

export default router;
