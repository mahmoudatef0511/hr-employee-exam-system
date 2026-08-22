const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Question extends Model {}

  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'exam_id'
      },
      questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'question_text'
      }
      // No correctAnswer field: questions are scored using the three-level
      // Yes/Partial/No answer system instead of an exact-match answer.
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions'
    }
  );

  return Question;
};
