const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

// load env
dotenv.config({
  path: process.env.ENV_PATH || path.resolve(process.cwd(), ".env"),
});

// Khởi tạo Sequelize từ connection string
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

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
