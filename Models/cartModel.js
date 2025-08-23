import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
    {
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
    },
    items: [
    {
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    priceAtTime: {
        type: Number,
        required: true
    }
    }
        ],
    totalPrice: {
    type: Number,
    default: 0
        }
    }, {
        timestamps: true, 
        versionKey: false
    });

const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;
