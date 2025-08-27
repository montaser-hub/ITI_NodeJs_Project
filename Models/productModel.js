import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 500,
        index: "text"
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true
    },  
    images: {
        type: [String],
        required: true,
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { 
    versionKey: false, 
    timestamps: true
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
