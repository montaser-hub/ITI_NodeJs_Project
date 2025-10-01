import Joi from "joi";

export const addWishlistSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});