import catchError from "../Middelwares/catchAsync.js";
import { Order } from "../Models/orderModel.js";
import { Payment } from "../Models/paymentsModel.js";

// @desc    Place an order from the cart
// @route   POST /api/orders
// @access  Private (User)
const placeOrder = catchError(async (req, res) => {
  const { cartItems, shippingAddress, shippingPrice, paymentMethodType } =
    req.body;

  const order = new Order({
    user: req.user._id,
    cartItems,
    shippingAddress,
    shippingPrice,
    paymentMethodType,
    totalOrderPrice: 1,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    View order history for the user
// @route   GET /api/orders/myorders
// @access  Private (User)
const getMyOrders = catchError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("cartItems.product", "name price")
    .populate("cartItems.product", "name price");
  res.json(orders);
});

// @desc    Get order by ID and track status
// @route   GET /api/orders/:id
// @access  Private (User/Admin)
const getOrderById = catchError(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("cartItems.product", "name price")
    .populate("payment");

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private (Admin)
const updateOrderToDelivered = catchError(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "shipped";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private (User)
const cancelOrder = catchError(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (
    order &&
    order.user.toString() === req.user._id.toString() &&
    order.user.toString() === req.user._id.toString() &&
    !order.isPaid &&
    !order.isDelivered &&
    !order.isCancelled
  ) {
    if (order.payment) {
      const payment = await Payment.findById(order.payment);
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }
    order.isCancelled = true;
    order.cancelledAt = Date.now();
    order.status = "cancelled";
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(400);
    throw new Error("Cannot cancel this order");
  }
});

export {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  cancelOrder,
};
