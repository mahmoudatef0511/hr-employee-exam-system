"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface) => {
    const hashed = await bcrypt.hash("password123", 10);
    await queryInterface.bulkInsert("hrs", [
      {
        name: "Admin HR",
        email: "hr@example.com",
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("hrs", { email: "hr@example.com" });
  },
};
