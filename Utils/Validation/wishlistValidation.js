import Joi from "joi";
import objectIdSchema from "../../schema.js";

export const addWishlistSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectIdSchema.required(),
      })
    )
    .min(1)
    .required(),
});