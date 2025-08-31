import Joi from "joi";
import objectIdSchema from "../../schema.js";
const itemSchema = Joi.object({
  productId: objectIdSchema.required().messages({
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).max(100).required().messages({
  }),
  quantity: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "Quantity must be Positive Number Greater Than 0",
    "number.max": "Quantity cannot exceed 100",
    "any.required": "Quantity is required",
  }),
    "any.required": "Quantity is required",
  })


export const cartValidationSchema = Joi.object({
  titleCart: Joi.string().min(5).max(50).required().messages({
    "string.empty": " Please Enter The Cart title, Don't leave It Empty ",
    "string.min": "Cart title must be at least 5 characters",
    "string.max": "Cart title cannot exceed 50 characters",
    "any.required": "Cart title is required",
  }),
  userId: objectIdSchema.required().messages({
    "any.required": "User ID is required",
  }),
  items: Joi.array().items(itemSchema).min(1).messages({
    "array.min": "Cart must have at least one item",
  }),
});
