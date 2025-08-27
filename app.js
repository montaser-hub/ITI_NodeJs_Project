import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js"; // import configured swagger-jsdoc output
import userRoutes from "./routes/userRoutes.js";

const app = express();

// logging middleware in development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// parse JSON request bodies for POST, PUT and PATCH requests(reading data from body into req.body)
app.use( express.json() );

app.use( userRoutes);

// Swagger Docs Route
app.use( "/api-docs", swaggerUi.serve, swaggerUi.setup( swaggerSpec ) );
// Raw JSON (for Apidog/Postman/etc.)
app.get("/api-docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use((req, res, next) => {
  console.log("Hello from the MIDDLEWARE :eight_spoked_asterisk:");
  next();
});


export default app;
