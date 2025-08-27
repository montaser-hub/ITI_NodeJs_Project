// TODO:Hager
import catchError from "../Middelwares/catchError.js";
import ProductModel from "../Models/productModel.js";

// Get products with pagination
const getProducts = catchError(async (req, res) => {
  try {
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
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      message: "success",
      page,
      limit,
      totalPages,
      totalProducts,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
const getProductById = catchError(async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("category", "name")
      .populate("user", "name email");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "success", data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
const createProduct = catchError(async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
const updateProduct = catchError(async (req, res) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", data: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
const deleteProduct = catchError(async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
