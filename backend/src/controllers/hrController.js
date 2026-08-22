const { Exam, Employee, Question, Submission, Answer } = require("../models");
const { success } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// GET /api/hr/submissions
// HR can see submissions from all employees.
async function listAllSubmissions(req, res, next) {
  try {
    const submissions = await Submission.findAll({
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email"],
        },
        { model: Exam, as: "exam", attributes: ["id", "title"] },
      ],
      order: [["submitted_at", "DESC"]],
    });
    return success(res, 200, submissions);
  } catch (err) {
    next(err);
  }
}

// GET /api/hr/submissions/:id
async function getSubmissionDetails(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email"],
        },
        { model: Exam, as: "exam", attributes: ["id", "title"] },
        {
          model: Answer,
          as: "answers",
          include: [{ model: Question, as: "question" }],
        },
      ],
    });

    if (!submission) throw new AppError("Submission not found.", 404);

    return success(res, 200, submission);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAllSubmissions, getSubmissionDetails };
