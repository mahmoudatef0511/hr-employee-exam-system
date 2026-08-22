"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface) => {
    const hashed = await bcrypt.hash("password123", 10);
    await queryInterface.bulkInsert("employees", [
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Ali",
        email: "sarah@example.com",
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("employees", {
      email: ["john@example.com", "sarah@example.com"],
    });
  },
};
