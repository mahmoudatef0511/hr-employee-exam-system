"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("answers", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      submission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "submissions", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "questions", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      // Three-level scoring: Yes = 2 points, Partial = 1 point, No = 0 points.
      answer: {
        type: Sequelize.ENUM("Yes", "Partial", "No"),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("answers");
  },
};
