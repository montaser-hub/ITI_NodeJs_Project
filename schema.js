import Joi from "joi";

const objectIdSchema = Joi.string()
.regex(/^[0-9a-fA-F]{24}$/)
.message("Invalid ObjectID format");

export default objectIdSchema ;