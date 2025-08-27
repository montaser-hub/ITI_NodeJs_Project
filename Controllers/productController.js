// TODO:Hager
import catchError from "../Middelwares/catchAsync.js";
import ProductModel from "../Models/productModel.js";

// Get products with pagination
const getProducts = catchError(async (req, res) => {
    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // default 10
    const skip = (page - 1) * limit;

    const products = await ProductModel.find()
      .populate("category", "name")
      .populate("user", "name email")
      .skip(skip)
      .limit(limit);

    const totalProducts = await ProductModel.countDocuments();
   

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
      user: req.user?._id,
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
