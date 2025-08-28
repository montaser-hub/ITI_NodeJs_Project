import cartModel from "../Models/cartModel.js";
import catchError from "../Middelwares/catchAsync.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";
// create cart
export const createCart = catchError(async (req, res) => {
        const userId = req.user._id;
        let data = req.body;
        data.userId = userId
        let newCart = await cartModel.create(data);
        res.status(201).json({ message: "Cart Created Successfully", data: newCart });
});
// Get Cart
export const getCart = catchError(async (req, res) => {

    const cart = await findCartById(req.params.cartId)
                        ; 
    res.status(200).json({message: "Cart retrieved successfully",data: cart,});
});
// Get All Carts
export const getCarts = catchError(async (req, res) => {
    const query = req.query;
    const filter = filterQuery(query);
    const { skip, limit } = paginateQuery(query);
    const sort = sortQuery(query);
    const carts = await cartModel.find(filter).skip(skip).limit(limit).sort(sort)
                        .populate("userId", "name")
                        .populate("items.productId", "name price");  
    const total = await cartModel.countDocuments(filter);
    // if(carts.length === 0) return  res.status(404).json({message: " No cart found"});
    // res.status(200).json({message: "cart retrieved successfully", data: carts,});
    res.status(200).json({ total, page: query.page, limit: query.limit, data: carts });

});
// Update Cart
export const updateCart = catchError(async (req, res) => {
    const cart = await findCartById(req.params.cartId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const updatedCart = await cartModel.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators: true,});
    res.status(200).json({ message: "Cart updated successfully", data: cart });
});
// Delete Cart
export const deleteCart = catchError(async (req, res) => {
    const cart = await findCartById(req.params.cartId);
    const deletedCart = await cartModel.findByIdAndDelete(cart) 
    res.status(200).json({ message: "Cart Deleted Successfully And Related Products Deleted", data: deletedCart,});
});
// Delete Carts
export const deleteCarts = catchError(async (req, res) => {
    const deletedCart = await cartModel.deleteMany({ userId: req.params.userId }) 
    res.status(200).json({ message: "All Carts Of The User Deleted Successfully And Related Products Deleted", data: deletedCart,});
});

async function findCartById(id) {
    const Cart = await cartModel.findById(id)
                        .populate("userId", "name")
                        .populate("items.productId", "name price");
    if (!Cart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    return Cart;
}
