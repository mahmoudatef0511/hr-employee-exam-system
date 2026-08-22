const { DataTypes, Model } = require('sequelize');

// The three allowed values for an Answer, and their point values.
// Exported so services/controllers can reuse the same source of truth.
const ANSWER_VALUES = ['Yes', 'Partial', 'No'];
const ANSWER_POINTS = { Yes: 2, Partial: 1, No: 0 };

module.exports = (sequelize) => {
  class Answer extends Model {}

  Answer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      submissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'submission_id'
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'question_id'
      },
      answer: {
        type: DataTypes.ENUM(...ANSWER_VALUES),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Answer',
      tableName: 'answers'
    }
  );

  Answer.ANSWER_VALUES = ANSWER_VALUES;
  Answer.ANSWER_POINTS = ANSWER_POINTS;

  return Answer;
};
