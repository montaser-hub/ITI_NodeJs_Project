import express from "express";
import { protect } from "../Controllers/authController.js";
import { createCart,getCart,getCarts,updateCart,deleteCart,deleteCarts} from "../Controllers/cartController.js";
import validationMiddleware from "../Middelwares/validation.js";
import {cartValidationSchema} from "../Utils/Validation/cartValidation.js"
const cartRouter = express.Router();
cartRouter.post("/carts",protect, validationMiddleware(cartValidationSchema) , createCart);
cartRouter.route("/carts/:userId")
                .get(protect,getCart)
                .put(protect,validationMiddleware(cartValidationSchema), updateCart)
                .delete(protect,deleteCart)
cartRouter.route("/carts")
                .get(protect,getCarts)
                .delete(protect,deleteCarts);
export default cartRouter;