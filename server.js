const express = require("express");
require("dotenv").config();

// const app = require("./src/app");
const config = require("./src/config/env");
const errorHandler = require("./src/middlewares/errorHandler");

const { connectDB } = require("./src/config/database");
const apiRouter = require("./src/routes");
require("./src/models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use("/api/v1", apiRouter);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
