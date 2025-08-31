import { Payment } from "../Models/paymentsModel.js";
import { Order } from "../Models/orderModel.js";
import fetch from "node-fetch";
import appError from "../Utils/apiError.js";


async function getPayPalAccessToken() {
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
    throw new apiError("Failed to get PayPal access token", 401);
  }
  return data.access_token;
}

/**
 * @desc Create PayPal Order
 * @route POST /api/payments/paypal/:orderId
 * @access Private
 */
const createPayPalPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return next(new apiError("Order not found", 404));

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
      return res
        .status(500)
        .json({ error: "Failed to create PayPal order", details: data });
    }

    order.paypalOrderId = data.id;
    await order.save();

    const approveLink = data.links.find((l) => l.rel === "approve")?.href;
    if (!approveLink) return next(new apiError("No approve link found", 404));

    res.json({ url: approveLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc PayPal Webhook
 * @route POST /api/payments/paypal/webhook
 * @access Public
 */
const paypalWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    const requiredHeaders = [
      "paypal-auth-algo",
      "paypal-cert-url",
      "paypal-transmission-id",
      "paypal-transmission-sig",
      "paypal-transmission-time",
    ];

    for (const header of requiredHeaders) {
      if (!req.headers[header]) return next(new apiError(`Missing required header: ${header}`, 400));
    }

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

    if (!response.ok || verifyResponse.verification_status !== "SUCCESS") return next(new appError("Webhook verification faild", 400));
    let orderObjectId;
    
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
      case "CHECKOUT.ORDER.APPROVED": {
        const orderId =
          event.resource?.custom_id ||
          event.resource?.purchase_units?.[0]?.custom_id;
        const captureId = event.resource?.id;

        if (!orderId) break;

        const order = await Order.findById(orderId);
        if (!order) break;

        let payment = await Payment.findOne({ orderId: order._id });
        if (!payment) {
          payment = new Payment({
            orderId: order._id,
            provider: "paypal",
            amount: order.totalOrderPrice,
            currency: "USD",
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
        if (!orderId) break;

        const order = await Order.findById(orderId);
        if (!order) break;

        let payment = await Payment.findOne({ orderId: order._id });
        if (!payment) {
          payment = new Payment({
            orderId: order._id,
            provider: "paypal",
            amount: order.totalOrderPrice,
            currency: "USD",
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
  } catch (err) {
    return next(new appError(`server Error ${err.mesage}`, 500));
  }
};

/**
 * @desc Capture PayPal Payment
 * @route GET /api/payments/paypal/capture/:orderId
 * @access Public
 */
const capturePayPalPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;

    if (!token) return next(new apiError("No token provided", 400));

    const order = await Order.findById(orderId);
    if (!order) return next(new apiError("Order not found", 404));

    const payment = await Payment.findOne({
      orderId: new mongoose.Types.ObjectId(orderId),
    });
    if (!payment) return next(new apiError("Payment not found", 404));

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
    if (!response.ok) return next(new apiError(`Failed to capture payment : ${data}`, 500));

    payment.status = "success";
    payment.transactionReference = data.id || payment.transactionReference;
    await payment.save();

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "paid";
    await order.save();

    res.redirect("/success");
  } catch (err) {
    return next(new apiError(`server Error ${err.mesage}`, 500));
  }
};

export { createPayPalPayment, paypalWebhook, capturePayPalPayment };
