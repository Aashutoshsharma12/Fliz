import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const path = require("path");

const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fliz Nodejs Backend API", // Project Name
      description: "Fliz Project Under Developement Mode ", // Project description
      version: "1.0.0", // Version of api
      contact: {
        name: "Tecorb Technologies Pvt. Ltd.", // your name
        email: "sales@tecorb.co", // your email
        url: "tecorb.com", // your website
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local-host server",
      },
      {
        url: "http://localhost:3001/api/v1",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Endpoints related to authentication",
      },
      // {
      //   name: 'User Management',
      //   description: 'Endpoints related to user management',
      // }
    ],
  },
  apis: [
    "./src/routes/app/common_api/auth.ts",
    // './src/routes/category.ts',
    // './src/routes/explore.ts',
    // Add more routes as needed
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: any, port: any) {
  // Swagger Page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  // console.info(` API Documentations available at http://localhost:${port}/docs`)
  // console.info(` API JSON available at http://localhost:${port}/docs.json`)
}

export default swaggerDocs;
