import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DocuChat API",
      version: "1.0.0",
      description: "AI-powered document Q&A system",
    },
    servers: [{ url: "/api/v1", description: "Version 1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/docs/**/*.yaml", "./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
