"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("exams", [
      {
        id: 1,
        title: "JavaScript Basics",
        description: "Fundamental JavaScript concepts",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "Node.js Basics",
        description: "Core Node.js concepts",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("questions", [
      {
        id: 1,
        exam_id: 1,
        question_text: "Can the employee explain what a closure is?",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        exam_id: 1,
        question_text:
          'Does the employee understand the difference between "==" and "==="?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        exam_id: 1,
        question_text:
          'Can the employee correctly use "let" and "const" for variable scoping?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        exam_id: 2,
        question_text:
          "Is the employee comfortable with the CommonJS module system (require/module.exports)?",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        exam_id: 2,
        question_text:
          "Can the employee set up a basic Express server and route?",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("questions", null);
    await queryInterface.bulkDelete("exams", null);
  },
};
