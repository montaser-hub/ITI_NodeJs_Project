import Wishlist from "../Models/wishlistModel.js";
import AppError from "../Utils/appError.js";

export const addToWishlistHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;
    console.log(req.user.id);
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items,
      });
    } else {
      items.forEach((item) => {
        if (
          !wishlist.items.some((i) => i.productId.toString() === item.productId)
        ) {
          wishlist.items.push(item);
        }
      });
      await wishlist.save();
    }

    return res.status(201).json({
      status: "success",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const getWishlistHandler = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    if (!wishlist) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlistHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return next(new AppError("Wishlist not found", 404));
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      status: "success",
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};
