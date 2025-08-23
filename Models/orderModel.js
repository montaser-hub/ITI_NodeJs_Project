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
    },

    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,
  },
  { timestamps: true, versionKey: false }
);

// Before saving the order, calculate the total price = Sum of (Price x Quantity) + Shipping Price
orderSchema.pre("save", function (next) {
  if (this.cartItems?.length) {
    const subtotal = this.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    this.totalOrderPrice = subtotal + this.shippingPrice;
  }
  next();
});

// Index to speed up fetching all requests for a specific user
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
