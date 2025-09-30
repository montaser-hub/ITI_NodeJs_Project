import cartModel from "../Models/cartModel.js";
import ProductModel from "../Models/productModel.js";
import catchError from "../Middelwares/catchError.js";
import AppError from "../Utils/appError.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";

// Add or update cart
export const createCart = catchError(async (req, res, next) => {
  const { titleCart, items } = req.body;
  // Validate each item in the cart
  const itemDetails = [];
  for (const item of items) {
    const product = await ProductModel.findById(item.productId);
    if (!product) return next(new AppError(`Product with ID ${item.productId} not found`, 404));
    if (product.quantity < item.quantity) {
    return next(new AppError(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,400));
    }
    itemDetails.push({productId: item.productId, quantity: item.quantity, priceAtTime: product.price,});
  }
  // Check if user has an existing cart that hasn't been converted to an order
  let cart = await cartModel.findOne({ userId: req.user._id });

  if (cart) {
    // Update existing cart
    for (const newItem of itemDetails) {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === newItem.productId.toString()
      );
      if (existingItem) {
        // Update quantity if product already exists in cart
        existingItem.quantity += newItem.quantity;
        if (existingItem.quantity > 100) return next(new AppError(`Total quantity for product ${newItem.productId} cannot exceed 100`,400));
        existingItem.priceAtTime = newItem.priceAtTime; // Update price if changed
      } else {
        // Add new item to cart
        cart.items.push(newItem);
      }
    }
    // Update title if provided
    if (titleCart) {
      cart.titleCart = titleCart;
    }
    await cart.save();
  } else {
    // Create new cart if none exists
    cart = await cartModel.create({
      titleCart: titleCart || "Default Cart", // Provide default title if not provided
      userId: req.user._id,
      items: itemDetails,
    });
  }
  res.status(201).json({ message: "Cart Updated Successfully", data: cart });
});

// Get cart by ID
export const getCart = catchError(async (req, res, next) => {
  const cart = await cartModel.findOne({ userId: req.user._id }).populate("items.productId", "name price");
  if (!cart) return next(new AppError("Cart not found",404));
  res.status(200).json({ message: "Cart retrieved successfully", data: cart });
});

// Get all carts In DB
export const getCarts = catchError(async (req, res, next) => {
    const query = req.query;
    const filter = filterQuery(query);
    const { skip, limit } = paginateQuery(query);
    const sort = sortQuery(query);
    const carts = await cartModel.find(filter).skip(skip).limit(limit).sort(sort)
                        .populate("userId", "name")
                        .populate("items.productId", "name price");
    if (!carts || carts.length === 0) return next (new AppError( "No carts found",404 ));
    const total = await cartModel.countDocuments(filter);
    res.status(200).json({ total, page: query.page|| 1 , limit: query.limit|| 2 , data: carts });
});
// update Quantity
export const updateCartItemQuantity = catchError(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) return next(new AppError("Product not found in cart", 404));
  item.quantity = quantity;
  await cart.save();
  res.status(200).json({
    message: "Product quantity updated successfully",
    data: item,
  });
});
// delete item from cart 
export const removeCartItem = catchError(async (req, res, next) => {
  const { productId } = req.params;
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );
  if (itemIndex === -1) return next(new AppError("Product not found in cart", 404));
  cart.items.splice(itemIndex, 1);
  if (cart.items.length === 0) {
    await cart.deleteOne();
    return res.status(200).json({
      message: "Product removed successfully, cart deleted because it was empty",
    });
  }
  await cart.save();
  res.status(200).json({
    message: "Product removed successfully",
    items: cart.items,
  });
});

// Delete a single cart Of User
export const deleteCart = catchError(async (req, res, next) => {
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));
  await cart.deleteOne();
  res.status(200).json({
    message: "Cart Deleted Successfully",
    data: cart,
  });
});
// Delete all carts In DB
export const deleteCarts = catchError(async (req, res, next) => {
  const result = await cartModel.deleteMany({}); 
  if (result.deletedCount === 0) return next(new AppError("No carts found to delete", 404));
  res.status(200).json({message: "All carts in the database deleted successfully",deletedCount: result.deletedCount,});
});

