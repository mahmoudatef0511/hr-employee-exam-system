"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exam_assignments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "employees", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "exams", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      // Which HR user assigned the exam (audit trail). Nullable so the
      // assignment survives if the HR account is later removed.
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "hrs", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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

    // An exam can only be assigned to the same employee once.
    await queryInterface.addConstraint("exam_assignments", {
      fields: ["employee_id", "exam_id"],
      type: "unique",
      name: "unique_employee_exam_assignment",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("exam_assignments");
  },
};
