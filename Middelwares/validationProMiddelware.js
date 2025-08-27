import productValidationSchema from "../Utils/Validation/productValidation.js";


export const validationMiddleware = (req, res, next) => {
    
    const validation = productValidationSchema.validate(req.body, {abortEarly: false , stripUnknown: true});
    if(validation.error) {
        return res.status(400).json({
            errors: validation.error.details.map(err => err.message)
        })
    }
    next();
}