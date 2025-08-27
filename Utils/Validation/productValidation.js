import Joi from "joi";
import objectIdSchema from "../../schema.js";

const productValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
  }),

  description: Joi.string().min(3).max(500).required().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 3 characters long",
    "string.max": "Description must be less than 500 characters long",
  }),

  price: Joi.number().integer().min(0).max(1000000).required().messages({
    "number.min": "Price must be more than 0",
    "number.max": "Price must be less than 1,000,000",
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),

  quantity: Joi.number().integer().min(0).max(1000000).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be more than 0",
    "number.max": "Quantity must be less than 1,000,000",
    "any.required": "Quantity is required",
  }),

  categoryId: objectIdSchema.required().messages({
    "string.pattern.base": "Category must be a valid ObjectId",
    "any.required": "category Id is required",
  }),

  images: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "Images must contain at least one image",
    "any.required": "Images are required",
  })
});

export default productValidationSchema;
