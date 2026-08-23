"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ties a submission to the exact assignment it was an attempt for.
    // Nullable because older data (backfilled below) may not have a
    // matching assignment to link to (e.g. it was later unassigned), and we
    // never want to lose a historical submission over that.
    await queryInterface.addColumn("submissions", "assignment_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "exam_assignments", key: "id" },
      // If the assignment row is later deleted, keep the submission —
      // history must survive even if the assignment audit row doesn't.
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // At most one submission per assignment (this is the DB-level backstop
    // for "one assignment = one attempt", in addition to the app-level
    // check). MySQL allows multiple NULLs through a unique index, so this
    // doesn't affect any row that isn't linked to an assignment.
    await queryInterface.addConstraint("submissions", {
      fields: ["assignment_id"],
      type: "unique",
      name: "unique_submission_per_assignment",
    });

    // --- Backfill existing data ---
    // Before this migration, exam_assignments had a unique (employee_id,
    // exam_id) constraint, so every pre-existing submission maps to exactly
    // one exam_assignments row. Link them, and mark that assignment
    // completed as of the submission time, since it represents a
    // already-used attempt under the old (unlimited-retake) behavior.
    await queryInterface.sequelize.query(`
      UPDATE submissions s
      JOIN exam_assignments ea
        ON ea.employee_id = s.employee_id
       AND ea.exam_id = s.exam_id
      SET s.assignment_id = ea.id
    `);

    await queryInterface.sequelize.query(`
      UPDATE exam_assignments ea
      JOIN submissions s ON s.assignment_id = ea.id
      SET ea.completed_at = s.submitted_at
      WHERE ea.completed_at IS NULL
    `);
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint(
      "submissions",
      "unique_submission_per_assignment"
    );
    await queryInterface.removeColumn("submissions", "assignment_id");
  },
};
