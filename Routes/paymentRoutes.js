import express from "express";
import { protect } from "../Controllers/authController.js";
import {
  paypalWebhook,
  createPayPalPayment,
  capturePayPalPayment,
} from "../Controllers/paymentsController.js";

const router = express.Router();

router.post("/paypal/webhook", express.json(), paypalWebhook);
router.post("/paypal/:orderId", protect, createPayPalPayment);
router.post("/paypal/capture", protect, capturePayPalPayment);

export default router;
