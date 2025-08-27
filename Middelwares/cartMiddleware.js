import {cartValidationSchema, itemSchema} from "../Utils/Validation/cartValidation.js";


// catchError Middleware
export const catchError = (fn) => (req, res, next) => {
    fn(req, res, next).catch(err =>{
            if (err.isJoi) {
            return res.status(422).json({ message: err.details[0].message });
        }
        res.status(400).json({ message: err.message })
    });
};

// total price
export const calculateTotalPrice = (cart) => {
  return cart.items.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);
};


// cart validation middleware
export const cartValidationForCart = (req, res, next) => {
    const validation = cartValidationSchema.validate(req.body, {abortEarly: false} );
    if(validation.error) {
        return res.status(400).json({
            errors: validation.error.details.map(err => err.message)
        })
    }
    next();
};
export const cartValidationForProduct = (req, res, next) => {
    const validation = itemSchema.validate(req.body, {abortEarly: false} );
    if(validation.error) {
        return res.status(400).json({
            errors: validation.error.details.map(err => err.message)
        })
    }
    next();
};


