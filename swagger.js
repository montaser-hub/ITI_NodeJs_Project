import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "A sample API for demonstration purposes",
    },
    servers: [
      {
        url: "http://localhost:3000", // base URL for your API
      },
    ],
  },
  apis: ["./Routes/*.js"], // where Swagger looks for docs
};

export default swaggerJSDoc(swaggerOptions);


