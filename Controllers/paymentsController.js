import { Payment } from "../Models/paymentsModel.js";
import { Order } from "../Models/orderModel.js";
import fetch from "node-fetch";
import catchError from "../Middelwares/catchAsync.js";
import AppError from "../Utils/apiError.js";

// Validate environment variables
const validateEnvVars = () => {
  const requiredEnvVars = [
    "PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET",
    "PAYPAL_BASE_URL",
    "URL",
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new AppError(`Missing environment variable: ${envVar}`, 500);
    }
  }
};

// Get PayPal access token
async function getPayPalAccessToken() {
  validateEnvVars();
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new AppError("Failed to get PayPal access token", 500);
  }
  return data.access_token;
}

/**
 * @desc Create PayPal Order
 * @route POST /api/payments/paypal/:orderId
 * @access Private
 */
export const createPayPalPayment = catchError(async (req, res, next) => {
  // Validate order existence
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check order ownership
  if (order.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Not authorized to create payment for this order", 403)
    );
  }

  // Check order status
  if (order.isPaid || order.isCancelled || order.isDelivered) {
    return next(
      new AppError(
        "Order cannot be paid: already paid, cancelled, or delivered",
        400
      )
    );
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: order.totalOrderPrice.toFixed(2),
            },
            custom_id: order._id.toString(),
          },
        ],
        application_context: {
          return_url: `${process.env.URL}/success`,
          cancel_url: `${process.env.URL}/cancel`,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return next(
      new AppError(
        `Failed to create PayPal order: ${data.error || "Unknown error"}`,
        500
      )
    );
  }

  order.paypalOrderId = data.id;
  await order.save();

  const approveLink = data.links.find((l) => l.rel === "approve")?.href;
  if (!approveLink) {
    return next(new AppError("No approve link found", 500));
  }

  res.json({ url: approveLink });
});

/**
 * @desc PayPal Webhook
 * @route POST /api/payments/paypal/webhook
 * @access Public
 */
export const paypalWebhook = catchError(async (req, res, next) => {
  const event = req.body;
  const requiredHeaders = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];

  for (const header of requiredHeaders) {
    if (!req.headers[header]) {
      return next(new AppError(`Missing required header: ${header}`, 400));
    }
  }

  validateEnvVars();
  const verifyPayload = {
    auth_algo: req.headers["paypal-auth-algo"],
    cert_url: req.headers["paypal-cert-url"],
    transmission_id: req.headers["paypal-transmission-id"],
    transmission_sig: req.headers["paypal-transmission-sig"],
    transmission_time: req.headers["paypal-transmission-time"],
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: event,
  };

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    }
  );

  const verifyResponse = await response.json();
  if (!response.ok || verifyResponse.verification_status !== "SUCCESS") {
    return next(new AppError("Webhook verification failed", 400));
  }

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
    case "CHECKOUT.ORDER.APPROVED": {
      const orderId =
        event.resource?.custom_id ||
        event.resource?.purchase_units?.[0]?.custom_id;
      const captureId = event.resource?.id;

      if (!orderId) {
        return next(new AppError("Invalid order ID in webhook", 400));
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return next(new AppError("Order not found", 404));
      }

      // Check order status
      if (order.isPaid || order.isCancelled || order.isDelivered) {
        return next(
          new AppError(
            "Order cannot be processed: already paid, cancelled, or delivered",
            400
          )
        );
      }

      let payment = await Payment.findOne({ orderId: order._id });
      if (!payment) {
        payment = new Payment({
          orderId: order._id,
          provider: "paypal",
          amount: order.totalOrderPrice,
          currency: "USD", // Unified to USD
          status: "success",
          transactionReference: captureId,
        });
        await payment.save();
        order.payment = payment._id;
      } else {
        payment.status = "success";
        payment.transactionReference =
          captureId || payment.transactionReference;
        await payment.save();
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "paid";
      await order.save();

      break;
    }

    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.REFUNDED": {
      const orderId = event.resource?.custom_id;
      if (!orderId) {
        return next(new AppError("Invalid order ID in webhook", 400));
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return next(new AppError("Order not found", 404));
      }

      let payment = await Payment.findOne({ orderId: order._id });
      if (!payment) {
        payment = new Payment({
          orderId: order._id,
          provider: "paypal",
          amount: order.totalOrderPrice,
          currency: "USD", // Unified to USD
          status: "failed",
        });
        await payment.save();
        order.payment = payment._id;
      } else {
        payment.status = "failed";
        await payment.save();
      }

      order.status = "payment_failed";
      await order.save();

      break;
    }

    default:
      break;
  }

  res.sendStatus(200);
});

/**
 * @desc Capture PayPal Payment
 * @route GET /api/payments/paypal/capture/:orderId
 * @access Private
 */
export const capturePayPalPayment = catchError(async (req, res, next) => {
  const { orderId } = req.params;
  const { token } = req.query;

  if (!token) {
    return next(new AppError("No token provided", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check order ownership
  if (order.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Not authorized to capture payment for this order", 403)
    );
  }

  // Check order status
  if (order.isPaid || order.isCancelled || order.isDelivered) {
    return next(
      new AppError(
        "Order cannot be paid: already paid, cancelled, or delivered",
        400
      )
    );
  }

  const payment = await Payment.findOne({ orderId: order._id });
  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return next(
      new AppError(
        `Failed to capture payment: ${data.error || "Unknown error"}`,
        500
      )
    );
  }

  payment.status = "success";
  payment.transactionReference = data.id || payment.transactionReference;
  await payment.save();

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = "paid";
  await order.save();

  res.redirect("/success");
});
