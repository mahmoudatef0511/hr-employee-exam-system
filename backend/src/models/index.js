const sequelize = require('../config/database');

const HR = require('./HR')(sequelize);
const Employee = require('./Employee')(sequelize);
const Exam = require('./Exam')(sequelize);
const Question = require('./Question')(sequelize);
const Submission = require('./Submission')(sequelize);
const Answer = require('./Answer')(sequelize);
const ExamAssignment = require('./ExamAssignment')(sequelize);

// ---- Associations ----

// Exam 1:N Question
Exam.hasMany(Question, { foreignKey: 'examId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

// Employee 1:N Submission
Employee.hasMany(Submission, { foreignKey: 'employeeId', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Exam 1:N Submission
Exam.hasMany(Submission, { foreignKey: 'examId', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

// Submission 1:N Answer
Submission.hasMany(Answer, { foreignKey: 'submissionId', as: 'answers', onDelete: 'CASCADE' });
Answer.belongsTo(Submission, { foreignKey: 'submissionId', as: 'submission' });

// Question 1:N Answer
Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers', onDelete: 'CASCADE' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// Employee N:M Exam, through ExamAssignment ("HR assigns Exam to Employee").
// The through model is also exposed directly so controllers can query/create
// individual assignment rows (e.g. list assignments, check access, unassign).
Employee.belongsToMany(Exam, { through: ExamAssignment, foreignKey: 'employeeId', otherKey: 'examId', as: 'assignedExams' });
Exam.belongsToMany(Employee, { through: ExamAssignment, foreignKey: 'examId', otherKey: 'employeeId', as: 'assignedEmployees' });

Employee.hasMany(ExamAssignment, { foreignKey: 'employeeId', as: 'examAssignments', onDelete: 'CASCADE' });
ExamAssignment.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

Exam.hasMany(ExamAssignment, { foreignKey: 'examId', as: 'assignments', onDelete: 'CASCADE' });
ExamAssignment.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

HR.hasMany(ExamAssignment, { foreignKey: 'assignedBy', as: 'assignmentsMade' });
ExamAssignment.belongsTo(HR, { foreignKey: 'assignedBy', as: 'assignedByHr' });

// ExamAssignment 1:1 Submission ("this assignment was attempted via this
// submission"). One assignment can have at most one submission (enforced by
// a unique constraint on submissions.assignment_id).
ExamAssignment.hasOne(Submission, { foreignKey: 'assignmentId', as: 'submission' });
Submission.belongsTo(ExamAssignment, { foreignKey: 'assignmentId', as: 'assignment' });

module.exports = {
  sequelize,
  HR,
  Employee,
  Exam,
  Question,
  Submission,
  Answer,
  ExamAssignment
};
