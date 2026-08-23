const { sequelize, Exam, Question, Submission, Answer } = require("../models");
const { success } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { validateSubmission } = require("../utils/validators");
const { calculateScore } = require("../services/scoreService");
const { assertEmployeeIsAssigned } = require("./examController");

// GET /api/employee/submissions
// Only the logged-in employee's own submissions.
async function listMySubmissions(req, res, next) {
  try {
    const submissions = await Submission.findAll({
      where: { employeeId: req.user.id },
      include: [{ model: Exam, as: "exam", attributes: ["id", "title"] }],
      order: [["submitted_at", "DESC"]],
    });
    return success(res, 200, submissions);
  } catch (err) {
    next(err);
  }
}

// GET /api/employee/submissions/:id
// An employee must never be able to view another employee's submission.
async function getMySubmission(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        { model: Exam, as: "exam", attributes: ["id", "title"] },
        {
          model: Answer,
          as: "answers",
          include: [{ model: Question, as: "question" }],
        },
      ],
    });

    if (!submission) throw new AppError("Submission not found.", 404);
    if (submission.employeeId !== req.user.id) {
      throw new AppError("You do not have access to this submission.", 403);
    }

    return success(res, 200, submission);
  } catch (err) {
    next(err);
  }
}

// POST /api/employee/exams/:id/submit
// Body: { answers: [{ questionId, answer }] }
async function submitExam(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      await t.rollback();
      throw new AppError("Exam not found.", 404);
    }

    try {
      await assertEmployeeIsAssigned(req.user.id, exam.id);
    } catch (accessErr) {
      await t.rollback();
      throw accessErr;
    }

    const errors = validateSubmission(req.body);
    if (errors.length) {
      await t.rollback();
      throw new AppError("Validation failed.", 400, errors);
    }

    const questions = await Question.findAll({ where: { examId: exam.id } });
    if (questions.length === 0) {
      await t.rollback();
      throw new AppError("This exam has no questions yet.", 400);
    }

    // Every question on the exam must be answered exactly once.
    const questionIds = new Set(questions.map((q) => q.id));
    const answeredIds = new Set(
      req.body.answers.map((a) => Number(a.questionId)),
    );
    const missing = questions.filter((q) => !answeredIds.has(q.id));
    if (missing.length > 0) {
      await t.rollback();
      throw new AppError(
        "Every question must be answered before submitting.",
        400,
      );
    }
    const unknownAnswers = req.body.answers.filter(
      (a) => !questionIds.has(Number(a.questionId)),
    );
    if (unknownAnswers.length > 0) {
      await t.rollback();
      throw new AppError(
        "Submission includes answers for questions not on this exam.",
        400,
      );
    }

    const { score, maximumScore, total, details } = calculateScore(
      questions,
      req.body.answers,
    );

    const submission = await Submission.create(
      {
        employeeId: req.user.id,
        examId: exam.id,
        submitted_at: new Date(),
        score, // normalized, out of maximumScore (5)
        totalQuestions: total,
      },
      { transaction: t },
    );

    const answerRows = details.map((d) => ({
      submissionId: submission.id,
      questionId: d.questionId,
      answer: d.employeeAnswer,
    }));

    await Answer.bulkCreate(answerRows, { transaction: t });

    await t.commit();

    return success(
      res,
      201,
      { submissionId: submission.id, score, maximumScore, total },
      "Exam submitted successfully.",
    );
  } catch (err) {
    if (!t.finished) await t.rollback();
    next(err);
  }
}

module.exports = { listMySubmissions, getMySubmission, submitExam };
