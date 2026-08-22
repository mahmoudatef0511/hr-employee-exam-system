const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Exam extends Model {}

  Exam.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Exam',
      tableName: 'exams'
    }
  );

  return Exam;
};
