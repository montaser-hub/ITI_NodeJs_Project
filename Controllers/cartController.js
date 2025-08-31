import cartModel from "../Models/cartModel.js";
import ProductModel from "../Models/productModel.js";
import catchError from "../Middelwares/catchAsync.js";
import AppError from "../Utils/apiError.js";

// Add or update cart
export const createCart = catchError(async (req, res, next) => {
  const { titleCart, items } = req.body;

  // Validate each item in the cart
  const itemDetails = [];
  for (const item of items) {
    const product = await ProductModel.findById(item.productId);
    if (!product) {
      return next(
        new AppError(`Product with ID ${item.productId} not found`, 404)
      );
    }
    if (product.quantity < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          400
        )
      );
    }
    itemDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime: product.price,
    });
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
        if (existingItem.quantity > 100) {
          return next(
            new AppError(
              `Total quantity for product ${newItem.productId} cannot exceed 100`,
              400
            )
          );
        }
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
export const getCart = catchError(async (req, res) => {
  const cart = await cartModel
    .findById(req.params.cartId)
    .populate("items.productId", "name price");
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  if (cart.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this cart" });
  }

  res.status(200).json({ message: "Cart retrieved successfully", data: cart });
});

// Get all carts of a user
export const getCarts = catchError(async (req, res) => {
  const carts = await cartModel.find({ userId: req.user._id });
  if (!carts || carts.length === 0)
    return res.status(404).json({ message: "No carts found" });

  res
    .status(200)
    .json({ message: "Carts retrieved successfully", data: carts });
});

// Update cart
export const updateCart = catchError(async (req, res) => {
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  if (cart.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this cart" });
  }

  Object.assign(cart, req.body);
  await cart.save();

  res.status(200).json({ message: "Cart updated successfully", data: cart });
});

// Delete a single cart
export const deleteCart = catchError(async (req, res) => {
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  if (cart.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this cart" });
  }

  await cartModel.findByIdAndDelete(cart._id);

  res.status(200).json({ message: "Cart Deleted Successfully", data: cart });
});

// Delete all carts of a user
export const deleteCarts = catchError(async (req, res) => {
  const deletedCarts = await cartModel.deleteMany({ userId: req.user._id });
  res.status(200).json({
    message: "All Carts Of The User Deleted Successfully",
    data: deletedCarts,
  });
});
