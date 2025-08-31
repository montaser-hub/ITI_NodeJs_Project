
import cartModel from "../Models/cartModel.js";
import catchError from "../Middelwares/catchAsync.js";
import AppError from "../Utils/apiError.js";
export const createCart = catchError(async (req, res, next) => {
    const { titleCart, items } = req.body;
    const cartData = {titleCart: titleCart,userId: req.user._id,items,};
    let cart = await cartModel.findOne({ userId: req.user._id });
    if (cart) {
    cart.items.push(...items);
    if (titleCart) cart.titleCart = titleCart;} 
    else {cart = await cartModel.create(cartData);}
    await cart.save();
    res.status(201).json({message: "Cart saved successfully",data: cart,});
});
    // Get cart of User
    export const getCart = catchError(async (req, res, next) => {
    const cart = await cartModel.findById(req.user._id).populate("items.productId", "name price");
    if (!cart) return next(new AppError("Cart not found for this User",404));
    if (cart.userId.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to view this cart" ,403));
    res.status(200).json({ message: "Cart retrieved successfully", data: cart });
    });
    // Get all carts In DB
export const getCarts = catchError(async (req, res, next) => {
    const query = req.query;
    const filter = filterQuery(query);
    const { skip, limit } = paginateQuery(query);
    const sort = sortQuery(query);
    const carts = await cartModel.find(filter).skip(skip).limit(limit).sort(sort).populate("items.productId", "name price category description");
    const total = await cartModel.countDocuments(filter);
    if (!carts || carts.length === 0) return next(new AppError( "No carts found",404 ));
    res.status(200).json({message: "All carts retrieved successfully",total,page: Number(query.page) || 1,limit: Number(query.limit) || 3,totalPriceOfCarts,data: carts,});
});
    // Update cart
    export const updateCart = catchError(async (req, res, next) => {
    const cart = await cartModel.findById(req.user._id);
    if (!cart) return next(new AppError("Cart not found for this User",404));
    if (cart.userId.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to view this cart" ,403));
    Object.assign(cart, req.body);
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", data: cart });
});
    // Delete a single cart
    export const deleteCart = catchError(async (req, res, next) => {
    const cart = await cartModel.findById(req.user._id);
    if (!cart) return next(new AppError("Cart not found for this User",404));
    if (cart.userId.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to view this cart" ,403));
    await cartModel.findByIdAndDelete(cart._id);
    res.status(200).json({ message: "Cart Deleted Successfully", data: cart });
    });

// Delete all carts in the database
export const deleteCarts = catchError(async (req, res, next) => {
    const deletedCarts = await cartModel.deleteMany({});
    if (!deletedCarts||deletedCarts.deletedCount === 0) return next(new AppError("No carts found", 404));
    res.status(200).json({message: "All carts in the database deleted successfully",data: deletedCarts,});
});
