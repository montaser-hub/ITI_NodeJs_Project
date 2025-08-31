import Joi from "joi";

// Validation schema for placing an order (Approach 2)
const placeOrderSchema = Joi.object({
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

// Export validation middleware
export const validateOrderSchema = placeOrderSchema;
