"use strict";

// Assigns the two seeded exams to the two seeded employees, so the app
// demonstrates the assignment feature right after a fresh seed.
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("exam_assignments", [
      {
        employee_id: 1, // John Doe
        exam_id: 1, // JavaScript Basics
        assigned_by: 1, // Admin HR
        assigned_at: new Date("2026-08-19T09:00:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employee_id: 2, // Sarah Ali
        exam_id: 2, // Node.js Basics
        assigned_by: 1, // Admin HR
        assigned_at: new Date("2026-08-19T09:05:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Also give John a second, not-yet-taken exam so the dashboard shows
      // both an "available" exam and a past submission at the same time.
      {
        employee_id: 1, // John Doe
        exam_id: 2, // Node.js Basics
        assigned_by: 1, // Admin HR
        assigned_at: new Date("2026-08-21T09:00:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("exam_assignments", null);
  },
};
