import Joi from "joi";
import objectIdSchema from "../../schema.js";

export const addWishlistSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectIdSchema.required(),
        productName: Joi.string().optional(),
        productImage: Joi.string().optional(),
        price: Joi.number().optional(),
      })
    )
    .min(1)
    .required(),
});
