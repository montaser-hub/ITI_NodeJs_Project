import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import orderRoutes from "./Routes/orderRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import { globalError } from "./Middelwares/globalErrorHandler.js";

dotenv.config({ path: "./config.env" });

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(hpp());
app.use(compression());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/cancel", (req, res) => {
  res.send("CANCELLED payment");
});

app.get("/success", (req, res) => {
  res.send("SUCCESS payment");
});

// Global error handling middleware
app.use(globalError);

export default app;
