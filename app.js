import express from"express";
import morgan from"morgan";
import cartRouter from "./Routes/cartRoutes.js"
const app = express();

// logging middleware in development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// parse JSON request bodies for POST, PUT and PATCH requests(reading data from body into req.body)
app.use(express.json());
app.use(cartRouter);


app.use((req, res, next) => {
  console.log("Hello from the MIDDLEWARE :eight_spoked_asterisk:");
  next();
});


export default app;