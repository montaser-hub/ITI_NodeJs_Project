import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js"; // import configured swagger-jsdoc output

import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import userRoutes from "./routes/userRoutes.js";
import categoriesRouter from "./Routes/categoryRoutes.js";
import productRouter from "./Routes/productRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";

import AppError from "./Utils/apiError.js";

import globalErrorHandler from "./Controllers/errorController.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(hpp());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// parse JSON request bodies for POST, PUT and PATCH requests(reading data from body into req.body)
app.use(express.json());

app.use(userRoutes);
app.use(categoriesRouter);
app.use(productRouter);

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/cancel", (req, res) => {
  res.send("CANCELLED payment");
});

app.get("/success", (req, res) => {
  res.send("SUCCESS payment");
});

// Swagger Docs Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Raw JSON (for Apidog/Postman/etc.)
app.get("/api-docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use((req, res, next) => {
  console.log("Hello from the MIDDLEWARE :eight_spoked_asterisk:");
  next();
});

app.all("/{*any}", (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
