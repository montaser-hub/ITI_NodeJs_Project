import express from "express";
import {addProductToCart, updateProductQuantity, removeProductFromCart} from "../Controllers/cartController.js"
const cartRouter = express.Router();
cartRouter.post("/cart/item", addProductToCart)
cartRouter.put("/cart/user/:userId/item/:id", updateProductQuantity);
cartRouter.delete("/cart/user/:userId/item/:id", removeProductFromCart);
cartRouter.get("/cart/user/:userId", getCart);
cartRouter.delete("/cart/user/:userId", clearCart);

export default cartRouter;