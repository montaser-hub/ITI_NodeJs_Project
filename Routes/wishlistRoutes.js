import express from "express";
import { protect } from "../Controllers/authController.js";
import validationMiddleware from "../Middelwares/validation.js";
import { addWishlistSchema } from "../Utils/Validation/wishlistValidation.js";
import { addToWishlistHandler, getWishlistHandler, removeFromWishlistHandler } from "../Controllers/wishlistController.js"

const wishlistRouter = express.Router();


wishlistRouter.post(
  "/",
  protect,
  validationMiddleware(addWishlistSchema),
  addToWishlistHandler
);
wishlistRouter.get("/", protect, getWishlistHandler);

wishlistRouter.delete(
  "/:productId",
  protect,
  removeFromWishlistHandler
);

export default wishlistRouter;
