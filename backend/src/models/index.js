const sequelize = require('../config/database');

const HR = require('./HR')(sequelize);
const Employee = require('./Employee')(sequelize);
const Exam = require('./Exam')(sequelize);
const Question = require('./Question')(sequelize);
const Submission = require('./Submission')(sequelize);
const Answer = require('./Answer')(sequelize);

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

module.exports = {
  sequelize,
  HR,
  Employee,
  Exam,
  Question,
  Submission,
  Answer
};
