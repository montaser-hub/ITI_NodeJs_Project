// import AppError from "../utils/appError";

const handleJWTError = () => new Error("Invalid token, please login again.", 401);
const handleJWTExpierdError = () => new Error("Your token has expired, please login again.", 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith("/")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B) Render the error on the client
  console.error("ERROR: 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith("/")) {
    //A) operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //B) programming or other unknown error: don't leak error details
    //1) Log the error
    console.error("ERROR: 💥", err);

    //2) Send generic message to client
    return res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later.",
    });
  }
  //B) Render the error on the client
  //A) operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  //B) programming or other unknown error: don't leak error details
  //1) Log the error
  console.error("ERROR: 💥", err);

  //2) Send generic message to client
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Something went wrong",
  });
};

exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpierdError();
    sendErrorProd(error, req, res);
  }
};
