import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
    {
    titleCart:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    } ,
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
        default: 1,
        min: 1,
        max: 100
    },
    priceAtTime: {
        type: Number,
        min: 0
    },
    subTotal: { 
        type: Number, 
        default: 0
        }
}
    ],
    totalPrice: {
    type: Number,
    default: 0,
    min: 0
        }
    }, 
    {
        timestamps: true, 
        versionKey: false
    });

// cartSchema.pre("validate", function (next) {
//     if (this.items && this.items.length > 0) {
//         this.items.forEach(item => {
//             item.subTotal = item.priceAtTime * item.quantity;
//         });
//         this.totalPrice = this.items.reduce((sum, item) => sum + item.subTotal, 0);
//     } else {
//         this.totalPrice = 0;
//     }
//     next();
// });
cartSchema.pre("validate", function (next) {
    if (this.items && this.items.length > 0) {
        this.items.forEach(item => {
            const price = item.priceAtTime || 0;
            const qty = item.quantity || 0;
            item.subTotal = price * qty;
        });
        this.totalPrice = this.items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    } else {
        this.totalPrice = 0;
    }
    next();
});


const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;
