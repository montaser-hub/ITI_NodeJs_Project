import Joi from "joi";

export const categoryValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 3 characters",
    "string.max": "Category name must not exceed 50 characters",
  }),
  description: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 5 characters",
    "string.max": "Description must not exceed 200 characters",
  }),
});