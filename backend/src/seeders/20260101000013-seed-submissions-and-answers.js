"use strict";

// Example submissions so the HR dashboard has data immediately.
// Per-answer scoring: Yes = 2, Partial = 1, No = 0.
// Final score is normalized to a fixed 0-5 scale: (rawScore / maxRawScore) * 5,
// rounded to 1 decimal place. maxRawScore = numberOfQuestions * 2.
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("submissions", [
      {
        id: 1,
        employee_id: 1, // John Doe
        exam_id: 1, // JavaScript Basics (3 questions, max raw score 6)
        submitted_at: new Date("2026-08-20T10:30:00"),
        // Raw: Yes(2) + Yes(2) + No(0) = 4 / 6 -> (4/6)*5 = 3.333... -> 3.3
        score: 3.3,
        total_questions: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        employee_id: 2, // Sarah Ali
        exam_id: 2, // Node.js Basics (2 questions, max raw score 4)
        submitted_at: new Date("2026-08-20T14:00:00"),
        // Raw: Yes(2) + Partial(1) = 3 / 4 -> (3/4)*5 = 3.75 -> 3.8
        score: 3.8,
        total_questions: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("answers", [
      // Submission 1 (John, JS Basics, questions 1-3): Yes, Yes, No = 2+2+0 = 4
      {
        submission_id: 1,
        question_id: 1,
        answer: "Yes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        submission_id: 1,
        question_id: 2,
        answer: "Yes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        submission_id: 1,
        question_id: 3,
        answer: "No",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Submission 2 (Sarah, Node Basics, questions 4-5): Yes, Partial = 2+1 = 3
      {
        submission_id: 2,
        question_id: 4,
        answer: "Yes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        submission_id: 2,
        question_id: 5,
        answer: "Partial",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("answers", null);
    await queryInterface.bulkDelete("submissions", null);
  },
};
