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

const sendForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

export const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "SequelizeValidationError") {
    err = new ApiError(err.errors[0].message, 400);
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    err = new ApiError("Duplicate field value entered", 400);
  }

  if (process.env.NODE_ENV === "development") {
    sendForDev(err, res);
  }
};
