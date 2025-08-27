//use Joi
import Joi from "joi";

const userValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 30 characters long",
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
  }),
  age: Joi.number().required().min(0).max(100),
  photo: Joi.string().optional(),
  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .pattern(
      /*(           # Start of group
  (?=.*\d)      #   must contains one digit from 0-9
  (?=.*[a-z])       #   must contains one lowercase characters
  (?=.*[\W])        #   must contains at least one special character
              .     #     match anything with previous condition checking
                {8,20}  #        length at least 8 characters and maximum of 20 
)           # End of group */
      new RegExp(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{6,20})/)
    )
     .messages({
      "string.pattern.base":
        "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character, and be 8–20 characters long",
      "string.empty": "Password cannot be empty",
    }),
  passwordConfirm: Joi.string().optional(),
  isConfirimed: Joi.boolean().default(false),
  active: Joi.boolean().default(true),
  role: Joi.string().valid("user", "admin").default("user"),
});

export default userValidationSchema;
