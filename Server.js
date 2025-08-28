import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";

dotenv.config({ path: "./config.env" });

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION: 💥 Shutting down...", err);
  process.exit(1);
});

import app from "./app.js";

// Database configuration
const startServer = async () => {
  const port = process.env.PORT || 3000;
  try {
    await mongoose
      .connect(
        process.env.DATABASE.replace(
          "<PASSWORD>",
          process.env.DATABASE_PASSWORD
        )
      )
      .then(() => console.log("DB connection successful!"))
      .catch((err) => console.error("DB connection error:", err));

    // Add raw body parser for Stripe webhook
    app.use(
      "/api/payments/stripe/webhook",
      express.raw({ type: "application/json" })
    );

    // Parse JSON for other routes
    app.use(express.json());

    app.listen(port, () => console.log(`Server running on port ${port}!`));
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();
