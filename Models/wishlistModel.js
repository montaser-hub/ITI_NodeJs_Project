import mongoose from "mongoose";

const WishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // store snapshot of product basic info to avoid extra joins and keep history
    productName: { type: String },
    productImage: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true, // one wishlist per user
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// optional helper: create a partial text index if you want to search productName
WishlistSchema.index({ "items.productName": "text" });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
