const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

// load env
dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), ".env"),
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
