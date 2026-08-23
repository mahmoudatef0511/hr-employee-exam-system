const { Exam, Question, ExamAssignment } = require('../models');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { validateExam, validateQuestion } = require('../utils/validators');

// Employees may only ever touch exams they have an ACTIVE (not yet
// completed) assignment for. Once an assignment is completed it no longer
// grants access — a fresh assignment from HR is required to take the exam
// again. Centralized here so every employee-facing route enforces it the
// same way, regardless of what the request body/params say.
//
// Returns the active assignment row (callers that need it, like
// submitExam, can reuse it instead of querying again).
async function assertEmployeeIsAssigned(employeeId, examId, options = {}) {
  const assignment = await ExamAssignment.findOne({
    where: { employeeId, examId, completedAt: null },
    ...options
  });
  if (!assignment) {
    throw new AppError('You do not have access to this exam.', 403);
  }
  return assignment;
}

// GET /api/exams  (available to any authenticated user)
// HR sees every exam. Employees only see exams assigned to them.
async function listExams(req, res, next) {
  try {
    let exams;
    if (req.user.type === 'employee') {
      // Only exams with a currently-active (not yet completed) assignment
      // count as "available". A completed assignment no longer surfaces the
      // exam here — a new assignment from HR is required for that.
      exams = await Exam.findAll({
        include: [
          {
            model: ExamAssignment,
            as: 'assignments',
            where: { employeeId: req.user.id, completedAt: null },
            attributes: []
          }
        ],
        order: [['id', 'ASC']]
      });
    } else {
      exams = await Exam.findAll({ order: [['id', 'ASC']] });
    }
    return success(res, 200, exams);
  } catch (err) {
    next(err);
  }
}

// GET /api/exams/:id
async function getExam(req, res, next) {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) throw new AppError('Exam not found.', 404);

    if (req.user.type === 'employee') {
      await assertEmployeeIsAssigned(req.user.id, exam.id);
    }

    return success(res, 200, exam);
  } catch (err) {
    next(err);
  }
}

// GET /api/exams/:id/questions
// Questions have no "correct answer" to hide — every question is scored via
// the employee's own Yes/Partial/No selection.
async function getExamQuestions(req, res, next) {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) throw new AppError('Exam not found.', 404);

    if (req.user.type === 'employee') {
      await assertEmployeeIsAssigned(req.user.id, exam.id);
    }

    const questions = await Question.findAll({
      where: { examId: req.params.id },
      order: [['id', 'ASC']]
    });

    return success(res, 200, questions);
  } catch (err) {
    next(err);
  }
}

// POST /api/exams  (HR only)
async function createExam(req, res, next) {
  try {
    const errors = validateExam(req.body);
    if (errors.length) throw new AppError('Validation failed.', 400, errors);

    const { title, description } = req.body;
    const exam = await Exam.create({ title, description });
    return success(res, 201, exam, 'Exam created.');
  } catch (err) {
    next(err);
  }
}

// POST /api/exams/:id/questions  (HR only)
async function addQuestion(req, res, next) {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) throw new AppError('Exam not found.', 404);

    const errors = validateQuestion(req.body);
    if (errors.length) throw new AppError('Validation failed.', 400, errors);

    const { questionText } = req.body;
    const question = await Question.create({
      examId: exam.id,
      questionText
    });

    return success(res, 201, question, 'Question added.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listExams,
  getExam,
  getExamQuestions,
  createExam,
  addQuestion,
  assertEmployeeIsAssigned
};
