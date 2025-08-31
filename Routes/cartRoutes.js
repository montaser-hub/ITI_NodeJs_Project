import express from "express";
import { protect } from "../Controllers/authController.js";
import { createCart,getCart,getCarts,updateCartItemQuantity,removeCartItem,deleteCart,deleteCarts} from "../Controllers/cartController.js";
import validationMiddleware from "../Middelwares/validation.js";
import {cartValidationSchema} from "../Utils/Validation/cartValidation.js"
import {QuantityValidationSchema } from "../Utils/Validation/cartValidation.js"
const cartRouter = express.Router();

cartRouter.post("/",protect, validationMiddleware(cartValidationSchema) , createCart);
cartRouter.route("/:cartId")
                .get(protect,getCart)
                .delete(protect,deleteCart);
cartRouter.route("/:cartId/items/:productId")
            .put(protect,validationMiddleware(QuantityValidationSchema ), updateCartItemQuantity)
            .delete(protect, removeCartItem)
cartRouter.route("/")
                .get(getCarts)
                .delete(deleteCarts);
export default cartRouter;