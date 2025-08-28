import Joi from "joi";
import objectIdSchema from "../../schema.js";


// Validation schema for placing an order
const placeOrderSchema = Joi.object({
  cartItems: Joi.array()
    .items(
      Joi.object({
        product: objectIdSchema.required()
          .messages({
            "any.required": "Product ID is required",
          }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.min": "Quantity cannot be less than 1",
          "any.required": "Quantity is required",
        }),
        price: Joi.number().positive().required().messages({
          "number.positive": "Price must be greater than 0",
          "any.required": "Price is required",
        }),
        color: Joi.string().trim().optional().allow("").messages({
          "string.base": "Color must be a string",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one cart item is required",
      "any.required": "Cart items are required",
    }),
  shippingAddress: Joi.object({
    details: Joi.string().trim().required().messages({
      "any.required": "Shipping address details are required",
      "string.empty": "Shipping address details cannot be empty",
    }),
    street: Joi.string().trim().required().messages({
      "any.required": "Street is required",
      "string.empty": "Street cannot be empty",
    }),
    city: Joi.string().trim().required().messages({
      "any.required": "City is required",
      "string.empty": "City cannot be empty",
    }),
  })
    .required()
    .messages({
      "any.required": "Shipping address is required",
    }),
  shippingPrice: Joi.number().min(0).default(0).messages({
    "number.min": "Shipping price cannot be negative",
  }),
  paymentMethodType: Joi.string()
    .valid("card", "cash")
    .default("cash")
    .messages({
      "any.only": 'Payment method must be either "card" or "cash"',
    }),
});

// Export validation middlewares
export const validateOrderSchema = placeOrderSchema;
