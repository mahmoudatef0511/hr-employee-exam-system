const { DataTypes, Model } = require('sequelize');

// Join table representing "HR assigned Exam X to Employee Y".
// An employee can only see/take an exam if a row exists here for them.
module.exports = (sequelize) => {
  class ExamAssignment extends Model {}

  ExamAssignment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'employee_id'
      },
      examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'exam_id'
      },
      assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_by'
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'assigned_at'
      }
    },
    {
      sequelize,
      modelName: 'ExamAssignment',
      tableName: 'exam_assignments'
    }
  );

  return ExamAssignment;
};
