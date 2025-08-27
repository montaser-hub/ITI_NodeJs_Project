import express from "express";
import { createCart,getCart,getCarts,updateCart,deleteCart,deleteCarts, addProductToCart,getProductOfCart,
        updateProduct, removeProductFromCart } from "../Controllers/cartController.js";
import {cartValidationForCart, cartValidationForProduct} from "../Middelwares/cartMiddleware.js";
const cartRouter = express.Router();

cartRouter.post("/cart/create", cartValidationForCart, createCart);
cartRouter.route("/user/:userId/cart/:cartId")
                .get(getCart)
                .put(cartValidationForCart, updateCart)
                .delete(deleteCart)
                .post(cartValidationForProduct, addProductToCart);
cartRouter.route("/user/:userId/carts")
                .get(getCarts)
                .delete(deleteCarts);
cartRouter.route("/user/:userId/cart/:cartId/item/:itemId")
                .get( getProductOfCart)
                .put(cartValidationForProduct, updateProduct)
                .delete(removeProductFromCart);
export default cartRouter;