// Sequelize CLI config (used for migrations/seeders). Reads from .env.
require('dotenv').config();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
};

module.exports = {
  development: common,
  test: common,
  production: common
};
