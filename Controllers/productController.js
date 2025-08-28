// TODO:Hager
import catchError from "../Middelwares/catchAsync.js";
import ProductModel from "../Models/productModel.js";
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";


// Get products with pagination
const getProducts = catchError(async (req, res) => {
    // pagination params
    const query = req.query;
    const filter = filterQuery(query);
    const { skip, limit } = paginateQuery(query);
    const sort = sortQuery(query);

    const products = await ProductModel.find(filter)
      .populate("categoryId", "name")
      .populate("addedBy", "name email role")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const totalProducts = await ProductModel.countDocuments(filter);
   

    res.json({
      message: "success",
      page,
      limit,
      totalProducts,
      data: products,
    });
 
});

// Get product by ID
const getProductById = catchError(async (req, res) => {
    const product = await ProductModel.findById(req.params.id)
      .populate("category", "name")
      .populate("user", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "success", data: product });
 
});

// Create product
const createProduct = catchError(async (req, res) => {
    const { name, description, price, quantity, category, images } = req.body;

    const newProduct = new ProductModel({
      name,
      description,
      price,
      quantity,
      category,
      images,
      addedBy: req.user?._id,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created", data: newProduct });
  
});

// Update product
const updateProduct = catchError(async (req, res) => {
 
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", data: updatedProduct });
  
});

// Delete product
const deleteProduct = catchError(async (req, res) => {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
});

export  {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
