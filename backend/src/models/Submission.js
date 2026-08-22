const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Submission extends Model {}

  Submission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "employee_id",
      },
      examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "exam_id",
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "submitted_at",
      },
      score: {
        // Normalized final score, out of 5 (e.g. 3.5, 4.0). Stored as a
        // decimal since normalization can produce fractional values.
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 0,
        get() {
          // Sequelize returns DECIMAL as a string by default; expose it as a number.
          const raw = this.getDataValue("score");
          return raw === null ? null : parseFloat(raw);
        },
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "total_questions",
      },
    },
    {
      sequelize,
      modelName: "Submission",
      tableName: "submissions",
    },
  );

  return Submission;
};
