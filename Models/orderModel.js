import mongoose from "mongoose";

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
          required: true,
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

// Index to speed up fetching all requests for a specific user
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
