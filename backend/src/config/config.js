require("dotenv").config();

require("mysql2");

const useSSL = process.env.DB_SSL === "true";

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  dialectOptions: useSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: common,
  test: common,
  production: common,
};
