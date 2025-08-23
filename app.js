import express from"express";
import morgan from"morgan";
import categoriesRouter from "./Routes/categoryRoutes.js";
import {errorHandler} from "./Middelwares/categoryMiddleWare.js";

const app = express();

// logging middleware in development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// parse JSON request bodies for POST, PUT and PATCH requests(reading data from body into req.body)
app.use(express.json());
app.use("/categories", categoriesRouter);
app.use(errorHandler);




app.use((req, res, next) => {
  console.log("Hello from the MIDDLEWARE :eight_spoked_asterisk:");
  next();
});


export default app;