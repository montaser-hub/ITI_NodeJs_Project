import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionReference: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// To speed up the connection between the Order and the Payment
paymentSchema.index({ orderId: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
