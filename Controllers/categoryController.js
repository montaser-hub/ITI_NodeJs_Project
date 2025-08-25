import categoryModel from "../Models/categoryModel.js";
import { catchError, isValidId } from "../Middelwares/categoryMiddleWare.js";
// import productModel from "../Models/productModel.js"; // Updated import to include isValidId

// Helper function to find category by ID
async function findCategoryById(id) {
    // Moved ID validation here
    if (!isValidId(id)) {
        const error = new Error("Invalid ID format");
        error.statusCode = 400;
        throw error;
    }
    const category = await categoryModel.findById(id)    //.lean();
    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }
    return category;
}

// GET /categories
export const getCategories = catchError(async (req, res) => {
    const categories = await categoryModel.find()   //.lean();
    if(categories.length === 0) return  res.status(404).json({message: " No Categorie found"});
    res.status(200).json({message: "Categories retrieved successfully", data: categories,});
});

// GET /categories/:id
export const getCategory = catchError(async (req, res) => {
    const category = await findCategoryById(req.params.id);
    res.status(200).json({message: "Category retrieved successfully",data: category,});
});

// POST /categories
export const createCategory = catchError(async (req, res) => {
    const category = await categoryModel.create(req.body);
    res.status(201).json({message: "Category created successfully",data: category,});
});

// PUT /categories/:id
export const updateCategory = catchError(async (req, res) => {
    await findCategoryById(req.params.id);
    const updatedCategory = await categoryModel
        .findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators: true,})  //
    res.status(200).json({message: "Category updated successfully",data: updatedCategory,});
});

// DELETE /categories/:id
export const deleteCategory = catchError(async (req, res) => {
    await findCategoryById(req.params.id);
    // await productModel.deleteMany({ category: category._id });

    const deletedCategory = await categoryModel.findByIdAndDelete(req.params.id) // Added lean for performance .lean();

    res.status(200).json({ message: "Category deleted successfully and related products deleted", data: deletedCategory,});
});