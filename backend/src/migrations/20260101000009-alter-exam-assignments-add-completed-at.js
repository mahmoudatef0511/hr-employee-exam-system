"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "exam_assignments";

    // The composite unique index (employee_id, exam_id) we're about to drop
    // is currently the ONLY index covering those columns, so it's also what
    // MySQL uses to satisfy the employee_id and exam_id foreign key
    // constraints. MySQL refuses to drop an index that's still backing a
    // FK ("needed in a foreign key constraint"), so each FK column needs
    // its own dedicated index first.
    const [existingIndexes] = await queryInterface.sequelize.query(
      `SHOW INDEX FROM \`${tableName}\``
    );
    const indexNames = new Set(existingIndexes.map((i) => i.Key_name));

    if (!indexNames.has("idx_exam_assignments_employee_id")) {
      await queryInterface.addIndex(tableName, {
        fields: ["employee_id"],
        name: "idx_exam_assignments_employee_id",
      });
    }
    if (!indexNames.has("idx_exam_assignments_exam_id")) {
      await queryInterface.addIndex(tableName, {
        fields: ["exam_id"],
        name: "idx_exam_assignments_exam_id",
      });
    }

    // The old constraint said "an exam can only ever be assigned to the same
    // employee once". That's no longer true: HR can create a new assignment
    // once the previous one is completed. Attempt lifecycle is now tracked
    // per-row via `completed_at` instead of being blocked at the DB level.
    await queryInterface.removeConstraint(
      tableName,
      "unique_employee_exam_assignment"
    );

    // NULL = assignment is still open (the employee hasn't taken it yet).
    // A timestamp = the employee submitted this specific assignment.
    await queryInterface.addColumn(tableName, "completed_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Every "is this employee's current assignment for this exam still
    // active" lookup filters on (employee_id, exam_id, completed_at), so
    // index that combination.
    await queryInterface.addIndex(tableName, {
      fields: ["employee_id", "exam_id", "completed_at"],
      name: "idx_exam_assignments_employee_exam_completed",
    });
  },
  down: async (queryInterface) => {
    const tableName = "exam_assignments";

    await queryInterface.removeIndex(
      tableName,
      "idx_exam_assignments_employee_exam_completed"
    );
    await queryInterface.removeColumn(tableName, "completed_at");
    await queryInterface.addConstraint(tableName, {
      fields: ["employee_id", "exam_id"],
      type: "unique",
      name: "unique_employee_exam_assignment",
    });

    // Leave idx_exam_assignments_employee_id / _exam_id in place — they're
    // harmless single-column indexes and still needed to back the FKs now
    // that the composite unique index covering them is gone.
  },
};
