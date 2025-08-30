import cartModel from "../Models/cartModel.js";
import catchAsync from "../Middelwares/catchAsync.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";
import AppError from "../Utils/apiError.js";
const cartPopulate = [
    { path: "userId", select: "name" },
    { path: "items.productId", select: "name price category description" }
];
// create cart
export const createCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    let data = req.body;
    data.userId = userId;
    const newCart = await cartModel.create(data);
    res.status(201).json({ message: "Cart Created Successfully", data: newCart });
});
// Get Cart
export const getCart = catchAsync(async (req, res, next) => {
    const cart = await findCartById(req.params.cartId);
    if (cart.userId._id.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to access this cart", 403));
    res.status(200).json({message: "Cart retrieved successfully",data: cart,});
});
// Get All Carts
export const getCarts = catchAsync(async (req, res, next) => {
    const query = req.query;
    const filter = filterQuery(query);
    const { skip, limit } = paginateQuery(query);
    const sort = sortQuery(query);
    const carts = await cartModel.find(filter).skip(skip).limit(limit).sort(sort).populate(cartPopulate);
    const total = await cartModel.countDocuments(filter);
    if (total === 0) return next(new AppError("No carts found for this user", 404));
    const totalPriceOfCarts = carts.reduce((sum, cart) => sum + (cart.totalPrice || 0),0);
    res.status(200).json({total,page: Number(query.page) || 1,limit: Number(query.limit) || 10,totalPriceOfCarts,data: carts,});
});
// Update Cart
export const updateCart = catchAsync(async (req, res, next) => {
    let cart = await findCartById(req.params.cartId);
    if (cart.userId._id.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to update this cart", 403));
    Object.assign(cart, req.body);
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", data: cart });
});
// Delete Cart
export const deleteCart = catchAsync(async (req, res, next) => {
    const cart = await findCartById(req.params.cartId);
    if (cart.userId._id.toString() !== req.user._id.toString()) return next(new AppError("Not authorized to delete this cart", 403));
    await cartModel.findByIdAndDelete(cart._id);
    res.status(200).json({message: "Cart Deleted Successfully",data: cart,});
});
// Delete Carts
export const deleteCarts = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const deletedResult = await cartModel.deleteMany({ userId });
    if (deletedResult.deletedCount === 0) return next(new AppError("No carts found for this user", 404));
    res.status(200).json({message: "All carts of the user deleted successfully",deletedCount: deletedResult.deletedCount,});});
// helper function
async function findCartById(id) {
    const cart = await cartModel.findById(id).populate(cartPopulate);
    if (!cart) return new AppError("Cart not found", 404);
    return cart;
}