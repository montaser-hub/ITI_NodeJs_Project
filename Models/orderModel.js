import mongoose from "mongoose";
import ProductModel from "./productModel.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        price: {
          type: Number,
        },
        color: String,
      },
    ],

    shippingAddress: {
      details: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
    },

    shippingPrice: {
      type: Number,
      default: 0,
    },

    totalOrderPrice: {
      type: Number,
      required: true,
      min: [1, "Order total price must be greater than 0"],
    },

    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isCancelled: { type: Boolean, default: false },
    cancelledAt: Date,

    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "payment_failed",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.pre("validate", async function (next) {
  try {
    if (!this.cartItems || this.cartItems.length === 0) {
      return next(new Error("Order must have at least one cart item"));
    }

    for (const item of this.cartItems) {
      if (!item.price) {
        const product = await ProductModel.findById(item.product);
        if (!product) {
          return next(new Error(`Product not found for ID: ${item.product}`));
        }
        item.price = product.price;
      }
    }

    const subtotal = this.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    this.totalOrderPrice = subtotal + this.shippingPrice;

    if (this.totalOrderPrice <= 0) {
      return next(new Error("Order total price must be greater than 0"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Before saving the order, calculate the total price = Sum of (Price x Quantity) + Shipping Price
orderSchema.pre("save", function (next) {
  if (!this.cartItems || this.cartItems.length === 0) {
    return next(new apiError("Order must have at least one cart item", 400));
  }
  if (this.cartItems?.length) {
    const subtotal = this.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    this.totalOrderPrice = subtotal + this.shippingPrice;
  }
  if (this.totalOrderPrice <= 0) {
    return next(new apiError("Order total price must be greater than 0", 400));
  }
  next();
});

// Index to speed up fetching all requests for a specific user
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
