import mongoose from "mongoose";

import dotenv from "dotenv";

//Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION: 💥 Shutting down...", err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
import app from "./app.js";
// 4) START THE SERVER

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
//return promise that can can access con = (connection object)
mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!")) //console.log(con.connections)
  .catch((err) => console.error("DB connection error:", err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
//Unhandled promise rejection is handled here
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 shutting down...");
  server.close(() => {
    process.exit(1);
  });
});