"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("questions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "exams", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      question_text: { type: Sequelize.TEXT, allowNull: false },
      // No correct_answer column: scored via the three-level Yes/Partial/No system.
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
    await queryInterface.dropTable("questions");
  },
};
