import mongoose from "mongoose";
import ProductModel from "./productModel.js";
import AppError from "../Utils/apiError.js";
const cartSchema = new mongoose.Schema(
    {
    titleCart: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    items: {
    type: [
        {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
            max: 100,
        },
        priceAtTime: {
            type: Number,
            min: 0,
        },
        subTotal: {
            type: Number,
            default: 0,
        },
        },
    ],
    required: true,
    },
    totalPrice: {
        type: Number,
        default: 0,
        min: 0,
    },
    },
    {
    timestamps: true,
    versionKey: false,
    }
);
cartSchema.pre("save", async function (next) {
    let total = 0;
    for (const item of this.items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
            return next(new AppError(`The Product Is Not Available Now`, 404));
        }
        item.priceAtTime = product.price;
        item.subTotal = product.price * item.quantity;
        total += item.subTotal;
    }
    this.totalPrice = total;
    next();
});
const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
