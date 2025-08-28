import express from "express";
import {
  paypalWebhook,
  createPayPalPayment,
} from "../Controllers/paymentsController.js";

const router = express.Router();

// PayPal Routes
router.post("/paypal/webhook", express.json(), paypalWebhook);
router.post("/paypal/:orderId", createPayPalPayment);

// Stripe Routes

// import {
//   createStripePayment,
//   stripeWebhookHandler,
//   stripeSuccess,
//   stripeCancel,
// } from "../Controllers/stripeController.js";

// router.post("/stripe/:orderId", createStripePayment);
// router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
// router.get("/stripe/success", stripeSuccess);
// router.get("/stripe/cancel", stripeCancel);

export default router;
