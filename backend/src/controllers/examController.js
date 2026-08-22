const { Exam, Question } = require('../models');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { validateExam, validateQuestion } = require('../utils/validators');

// GET /api/exams  (available to any authenticated user)
async function listExams(req, res, next) {
  try {
    const exams = await Exam.findAll({ order: [['id', 'ASC']] });
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
  addQuestion
};
