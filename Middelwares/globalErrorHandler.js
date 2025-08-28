export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    // Remove constructor stack trace from the error stack
    // so logs point to the original error location in your code
    Error.captureStackTrace(this, this.constructor);
  }
}


import ApiError from "../utils/apiError.js";

export const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((el) => el.message);
    err = new ApiError(messages.join(", "), 400);
  }

  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue);
    err = new ApiError(`Duplicate field value: ${field}. Please use another value.`, 400);
  }

  if (err.name === "CastError") {
    err = new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || "Something went wrong!",
    });
  }
};

