import categoryModel from "../Models/categoryModel.js";
import  catchError  from "../Middelwares/catchAsync.js";
import productModel from "../Models/productModel.js"; 
import { filterQuery, paginateQuery, sortQuery } from "../Utils/queryUtil.js";


// Helper function to find category by ID
async function findCategoryById(id) {

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
  const query = req.query;
  const filter = filterQuery(query);      
  const { skip, limit } = paginateQuery(query); 
  const sort = sortQuery(query);       

  const categories = await categoryModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await categoryModel.countDocuments(filter);

  if (!categories || categories.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }

  res.status(200).json({
    message: "Categories retrieved successfully",
    total,
    page: query.page,
    limit: query.limit,
    data: categories,
  });
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
   const category= await findCategoryById(req.params.id);
    console.log(req.params.id);
    await productModel.deleteMany({ category: category._id });

     await categoryModel.findByIdAndDelete(category._id)

    res.status(200).json({ message: "Category deleted successfully and related products deleted"});
});