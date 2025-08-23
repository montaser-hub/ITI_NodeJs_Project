import {cartModel} from "../Models/cartModel.js";
import Product from "../Models/productModel.js";
// Add Product To Cart
const addProductToCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const productId = req.body.productId;
        let quantity = Number(req.body.quantity);
        if (!userId || !productId) {return res.status(400).json({ message: "UserId and productId are required" });}
        if (!quantity || !Number.isFinite(quantity) || quantity <= 0) {quantity = 1;}
        const product = await Product.findById(productId);
        if (!product) {return res.status(404).json({ message: "Product not found" });}
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            cart = new cartModel({userId, items: [{ productId, quantity, priceAtTime: product.price }],});
            cart.totalPrice = product.price * quantity;
            await cart.save();
            return res.status(201).json({ message: "Product added to a new cart successfully.", cart });
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
        if (itemIndex > -1) {cart.items[itemIndex].quantity += quantity;}
        else {cart.items.push({productId, quantity, priceAtTime: product.price});}
        cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
        await cart.save();
        return res.status(200).json({ message: "Cart updated successfully.", cart });
    } catch (error) {return res.status(500).json({ message: "Internal server error." });}
};
// Change The Quantity Of Product In Cart
const updateProductQuantity = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.id;
        let quantity = Number(req.body.quantity);
        if (!userId || !productId) {return res.status(400).json({ message: "UserId and productId are required" });}
        if (!quantity || !Number.isFinite(quantity) || quantity <= 0) {return res.status(400).json({ message: "Quantity must be a positive number" });}
        let cart = await cartModel.findOne({ userId });
        if (!cart) {return res.status(404).json({ message: "Cart not found for this user." });}
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
        if (itemIndex === -1) {return res.status(404).json({ message: "Product not found in cart." });}
        cart.items[itemIndex].quantity = quantity;
        cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
        const updatedCart = await cart.save();
        return res.status(200).json({message: "Product quantity updated successfully.",cart: updatedCart});
    } catch (error) {return res.status(500).json({ message: "Internal server error." });}
};
// Remove Product From The Cart
const removeProductFromCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.id;
        if (!userId || !productId) {return res.status(400).json({ message: "UserId and ProductId are required." });}
        let cart = await cartModel.findOne({ userId });
        if (!cart) {return res.status(404).json({ message: "User don't have a Cart." });}
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());
        if (itemIndex === -1) {return res.status(404).json({ message: "Product not found in the cart." });}
        cart.items.splice(itemIndex, 1);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
        await cart.save();
        return res.status(200).json({ message: "Product removed from cart successfully.", cart, });
    } catch (error) {return res.status(500).json({ message: "Internal server error." });}
};
// Show All Products Of User In Cart
const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartModel.findOne({ userId }).populate('items.productId');
        if (!cart) {return res.status(404).json({ message: "Cart not found." });}
        const productTypesCount = cart.items.length;
        const totalProductsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        return res.status(200).json({ message: "Cart retrieved successfully.", productTypesCount, totalProductsCount,
            cart: {_id: cart._id, userId: cart.userId, items: cart.items, totalPrice: cart.totalPrice}
        });
    } catch (error) {return res.status(500).json({ message: "Internal server error." });}
};
// Remove All Products From Cart 
const clearCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await cartModel.findOne({ userId });
        if (!cart) {return res.status(404).json({ message: "Cart not found for this user." });}
        const totalProductsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        return res.status(200).json({message: "Cart cleared successfully.",cart,totalProductsCountDeleted: totalProductsCount});
    } catch (error) {return res.status(500).json({ message: "Internal server error." });}
};
export { addProductToCart, updateProductQuantity, removeProductFromCart, getCart, clearCart };