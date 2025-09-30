import { Payment } from "../Models/paymentsModel.js";
import { Order } from "../Models/orderModel.js";
import fetch from "node-fetch";
import catchError from "../Middelwares/catchError.js";
import AppError from "../Utils/appError.js";

// Make sure all required environment variables are present.
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

// Go to PayPal and retrieve an Access Token using your client_id and client_secret.
// This token is necessary to make any API calls with PayPal.
async function getPayPalAccessToken() {
  validateEnvVars();
  // Create the Authorization Header
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  /**
   * Depending on your environment:
   * Sandbox (for testing) → https://api-m.sandbox.paypal.com/v1/oauth2/token
   * Live (real) → https://api-m.paypal.com/v1/oauth2/token
   */
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
  // This line creates an order in PayPal using Bearer token.
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
          return_url: `${process.env.URL}/payments/success`,
          cancel_url: `${process.env.URL}/payments/cancel`,
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
  // event is The data you sent to PayPal (such as event_type, resource, etc.).
  const event = req.body;
  // The basic header that PayPal must send with every webhook so you can verify that the message is authentic.
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
  // This body is sent to the PayPal API to tell them: "Verify that this webhook is really from you and not fake."
  const verifyPayload = {
    auth_algo: req.headers["paypal-auth-algo"],
    cert_url: req.headers["paypal-cert-url"],
    transmission_id: req.headers["paypal-transmission-id"],
    transmission_sig: req.headers["paypal-transmission-sig"],
    transmission_time: req.headers["paypal-transmission-time"],
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: event,
  };

  // Sends a verifyPayload to PayPal.
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

  // If the response is not SUCCESS, the webhook is untrusted (fake/manipulated).
  const verifyResponse = await response.json();
  if (!response.ok || verifyResponse.verification_status !== "SUCCESS") {
    return next(new AppError("Webhook verification failed", 400));
  }

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
    case "CHECKOUT.ORDER.APPROVED": {
      // custom_id = the order number you sent with the payment (linked to the database)
      const orderId =
        event.resource?.custom_id ||
        event.resource?.purchase_units?.[0]?.custom_id;
      // captureId = PayPal transaction number (Transaction ID).
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
