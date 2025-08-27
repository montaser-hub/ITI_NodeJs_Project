import Joi from "joi";
import mongoose from "mongoose";
const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
    }
    return value;
    };
    
export const itemSchema = Joi.object({
    productId: Joi.string().custom(objectIdValidator, "There is a problem in ObjectId validation").required().messages({
        "any.required": "Product ID is required",
        "any.invalid": "Product ID must be a valid ObjectId"
    }),
    quantity: Joi.number().integer().min(1).max(100).required().messages({
        "number.min": "Quantity must be Positive Number Greater Than 0",
        "number.max": "Quantity cannot exceed 100",
        "any.required": "Quantity is required"
    })
});

export const cartValidationSchema = Joi.object({
    titleCart: Joi.string().min(5).max(50).required().messages({
        "string.empty": " Please Enter The Cart title, Don't leave It Empty ",
        "string.min": "Cart title must be at least 5 characters",
        "string.max": "Cart title cannot exceed 50 characters",
        "any.required": "Cart title is required"
    }),
    userId: Joi.string().custom(objectIdValidator, "There is a problem in ObjectId validation  ").required().messages({
        "any.required": "User ID is required",
        "any.invalid": "User ID must be a valid ObjectId"
    }),
    items: Joi.array().items(itemSchema).min(1).messages({
        "array.min": "Cart must have at least one item",
    })
});
export default cartValidationSchema;