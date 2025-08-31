import catchError from "../Middelwares/catchError.js";
import { Order } from "../Models/orderModel.js";
import { Payment } from "../Models/paymentsModel.js";
import Cart from "../Models/cartModel.js";
import AppError from "../Utils/appError.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";
import AppError from "../Utils/apiError.js";

// @desc    Place an order from the user's cart
// @route   POST /orders
// @access  Private (User)
const placeOrder = catchError(async (req, res, next) => {
  // 1. Get user's cart
  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    "items.productId",
    "price name"
  );

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // 2. Snapshot cart items (include price at the moment)
  const snapshotCartItems = cart.items.map((item) => ({
    product: item.productId._id,
    quantity: item.quantity,
    price: item.productId.price,
  }));

  // 3. Calculate total
  const subtotal = snapshotCartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const shippingPrice = req.body.shippingPrice || 0;
  const totalOrderPrice = subtotal + shippingPrice;

  // 4. Create order
  const order = new Order({
    user: req.user._id,
    cartItems: snapshotCartItems,
    shippingAddress: req.body.shippingAddress,
    shippingPrice,
    paymentMethodType: req.body.paymentMethodType || "cash",
    totalOrderPrice,
  });

  const createdOrder = await order.save();

  // 5. Clear cart after placing order
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json(createdOrder);
});

// @desc    View order history for the user
// @route   GET /orders/myorders
// @access  Private (User)
const getMyOrders = catchError(async (req, res, next) => {
  const query = req.query;
  const { skip, limit } = paginateQuery(query);
  const sort = sortQuery(query);
  const filter = { ...filterQuery(query), user: req.user._id };

  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate("cartItems.product", "name price");

  const total = await Order.countDocuments(filter);

  res
    .status(200)
    .json({ total, page: query.page, limit: query.limit, data: orders });
});

// @desc    View all orders (Admin)
// @route   GET /orders
// @access  Private (Admin)
const getOrders = catchError(async (req, res, next) => {
  const query = req.query;
  const filter = filterQuery(query);
  const { skip, limit } = paginateQuery(query);
  const sort = sortQuery(query);

  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate("cartItems.product", "name price");

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    total,
    page: query.page,
    limit: query.limit,
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /orders/:id
// @access  Private (User/Admin)
const getOrderById = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("cartItems.product", "name price")
    .populate("payment");

  if (order) {
    res.json(order);
  } else {
    return next(new AppError("Order not found", 404));
  }
});

// @desc    Update order to delivered
// @route   PUT /orders/:id/deliver
// @access  Private (Admin)
const updateOrderToDelivered = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "shipped";
    const updatedOrder = await order.save();
    res.status(200).json({
      message: "Order marked as delivered successfully",
      data: updatedOrder,
    });
  } else {
    return next(new AppError("Order not found", 404));
  }
});

// @desc    Cancel an order
// @route   PUT /orders/:id/cancel
// @access  Private (User)
const cancelOrder = catchError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (
    order &&
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
    res.status(200).json({
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } else {
    if (!order) {
      return next(new AppError("Cannot cancel this order", 404));
    }
  }
});

export {
  placeOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderToDelivered,
  cancelOrder,
};
