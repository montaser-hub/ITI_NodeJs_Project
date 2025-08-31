import mongoose from "mongoose";
import ProductModel from "./productModel.js";
import AppError from "../Utils/apiError.js";
import catchError from "../Middelwares/catchAsync.js";
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

cartSchema.pre("save", catchError(async function (next) {
    let mergedItems = [];
    for (const item of this.items) {
        const existing = mergedItems.find((i) => i.productId.toString() === item.productId.toString());
        if (existing) {existing.quantity += item.quantity;} 
        else {mergedItems.push(item.toObject());}
    }
    this.items = mergedItems;
    let total = 0;
    for (const item of this.items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) return next(new AppError(`Product not found`, 404));
        if (item.quantity > product.quantity) return next(new AppError(`Not enough stock for ${product.name}`,400));
        item.priceAtTime = product.price;
        item.subTotal = product.price * item.quantity;
        total += item.subTotal;
    }
    this.totalPrice = total;
    next();
} ));




const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
