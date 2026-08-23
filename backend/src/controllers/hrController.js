const { Exam, Employee, Question, Submission, Answer, ExamAssignment } = require("../models");
const { success } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { validateAssignment } = require("../utils/validators");

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

// GET /api/hr/employees
// Lets HR populate the "assign exam" dropdown with employees.
async function listEmployees(req, res, next) {
  try {
    const employees = await Employee.findAll({
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });
    return success(res, 200, employees);
  } catch (err) {
    next(err);
  }
}

// GET /api/hr/assignments
// All current exam-to-employee assignments, for the HR dashboard table.
async function listAssignments(req, res, next) {
  try {
    const assignments = await ExamAssignment.findAll({
      include: [
        { model: Employee, as: "employee", attributes: ["id", "name", "email"] },
        { model: Exam, as: "exam", attributes: ["id", "title"] },
      ],
      order: [["assigned_at", "DESC"]],
    });
    return success(res, 200, assignments);
  } catch (err) {
    next(err);
  }
}

// POST /api/hr/assignments
// Body: { employeeId, examId }
async function assignExam(req, res, next) {
  try {
    const errors = validateAssignment(req.body);
    if (errors.length) throw new AppError("Validation failed.", 400, errors);

    const { employeeId, examId } = req.body;

    const [employee, exam] = await Promise.all([
      Employee.findByPk(employeeId),
      Exam.findByPk(examId),
    ]);
    if (!employee) throw new AppError("Employee not found.", 404);
    if (!exam) throw new AppError("Exam not found.", 404);

    const existing = await ExamAssignment.findOne({ where: { employeeId, examId } });
    if (existing) {
      throw new AppError("This exam is already assigned to this employee.", 409);
    }

    const assignment = await ExamAssignment.create({
      employeeId,
      examId,
      assignedBy: req.user.id,
      assignedAt: new Date(),
    });

    return success(res, 201, assignment, "Exam assigned.");
  } catch (err) {
    next(err);
  }
}

// DELETE /api/hr/assignments/:id
async function unassignExam(req, res, next) {
  try {
    const assignment = await ExamAssignment.findByPk(req.params.id);
    if (!assignment) throw new AppError("Assignment not found.", 404);

    await assignment.destroy();
    return success(res, 200, null, "Assignment removed.");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAllSubmissions,
  getSubmissionDetails,
  listEmployees,
  listAssignments,
  assignExam,
  unassignExam,
};
