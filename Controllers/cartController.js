import cartModel from "../Models/cartModel.js";
import ProductModel from "../Models/productModel.js";
import {catchError} from "../Middelwares/cartMiddleware.js";
import {calculateTotalPrice} from "../Middelwares/cartMiddleware.js"
// create cart
export const createCart = catchError(async (req, res) => {
        let newCart = await cartModel.create(req.body);
        res.status(201).json({ message: "Cart Created Successfully", data: newCart });
});
// Get Cart
export const getCart = catchError(async (req, res) => {
    const cart = await cartModel.findById(req.params.cartId);
    res.status(200).json({message: "Cart retrieved successfully",data: cart,});
});
// Get All Carts
export const getCarts = catchError(async (req, res) => {
    const carts = await cartModel.find({ userId: req.params.userId })  
    if(carts.length === 0) return  res.status(404).json({message: " No cart found"});
    res.status(200).json({message: "cart retrieved successfully", data: carts,});
});
// Update Cart
// export const updateCart = catchError(async (req, res) => {
//     const updatedCart = await cartModel.findByIdAndUpdate(req.params.cartId, req.body, {new: true, runValidators: true,})  //
//     res.status(200).json({message: "Cart updated successfully",data: updatedCart,});
// });
export const updateCart = catchError(async (req, res) => {
    const cart = await cartModel.findById(req.params.cartId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    Object.assign(cart, req.body); 
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", data: cart });
});

// Delete Cart
export const deleteCart = catchError(async (req, res) => {
    const deletedCart = await cartModel.findByIdAndDelete(req.params.cartId) 
    res.status(200).json({ message: "Cart Deleted Successfully And Related Products Deleted", data: deletedCart,});
});
// Delete Carts
export const deleteCarts = catchError(async (req, res) => {
    const deletedCart = await cartModel.deleteMany({ userId: req.params.userId }) 
    res.status(200).json({ message: "All Carts Of The User Deleted Successfully And Related Products Deleted", data: deletedCart,});
});
// Add Product To Cart
export const addProductToCart = catchError(async (req, res) => {
        const { productId, quantity } = req.body;
        const { userId, cartId } = req.params;
        const productData = await ProductModel.findById(productId);
        const priceAtTime = productData.price;
        const subTotal = priceAtTime * quantity;
        const product = {productId, quantity,priceAtTime,subTotal};
        const cart = await cartModel.findOne({ _id: cartId, userId });
        cart.items.push(product);
        await cart.save();
        res.status(201).json({ message: "Product Add To Cart Successfully", data: product });
});

// Get Product In Cart
export const getProductOfCart = catchError(async (req, res) => {
    const { userId, cartId, itemId } = req.params;
    const selectedCart = await cartModel.findOne({ _id: cartId, userId  });
    const product = selectedCart.items.id(itemId)
    res.status(200).json({message: "The product retrieved successfully",data: product,});
});
// Update Product In cart
export const updateProduct = catchError(async (req, res) => {
    const { userId, cartId, itemId } = req.params;
    const selectedCart = await cartModel.findOne({ _id: cartId, userId  });
    const product = selectedCart.items.id(itemId);
    Object.assign(product, req.body); 
    // selectedCart.totalPrice = calculateTotalPrice(selectedCart);
    await selectedCart.save();
    res.status(200).json({message: "Product Updated Successfully.", data: product});
});
// Remove product from cart
export const removeProductFromCart = catchError(async (req, res) => {
    const { userId, cartId, itemId } = req.params;
    const selectedCart = await cartModel.findOne({ _id: cartId, userId  });
    const product = selectedCart.items.id(itemId);
    selectedCart.items.pull(itemId);
    // selectedCart.totalPrice = calculateTotalPrice(selectedCart);
    await selectedCart.save();
    res.status(200).json({ message: "Product Removed Successfully.", data: product});
});

