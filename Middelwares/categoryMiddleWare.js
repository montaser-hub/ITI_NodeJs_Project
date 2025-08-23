import mongoose from "mongoose";
import { categoryValidationSchema } from "../Utils/Validation/categoryValidation.js";

// Moved isValidId here for centralized use
export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateId = (req, res, next) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid category ID",
        });
    }
    next();
};

// Validate category data using Joi
export const validateCategory = async (req, res, next) => {
    const { error } = categoryValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((err) => ({ field: err.path.join("."), message: err.message })),
        });
    }
    // const { name } = req.body;
    // const existingCategory = await mongoose.model("category").findOne({ name }).lean();
    // if (existingCategory) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Category name already exists",
    //     });
    // }
    next();
};

// Async error handling wrapper
export  function catchError(MyFun) {
    return async (req, res, next) => {
        MyFun(req, res, next).catch((error) => {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists",
                });
            }
            next(error);
        });
    };
}


// Global error-handling middleware
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};