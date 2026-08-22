const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class Employee extends Model {
    async validatePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
    }

    toSafeJSON() {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        type: 'employee'
      };
    }
  }

  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'refresh_token'
      }
    },
    {
      sequelize,
      modelName: 'Employee',
      tableName: 'employees',
      hooks: {
        beforeCreate: async (employee) => {
          employee.password = await bcrypt.hash(employee.password, 10);
        },
        beforeUpdate: async (employee) => {
          if (employee.changed('password')) {
            employee.password = await bcrypt.hash(employee.password, 10);
          }
        }
      }
    }
  );

  return Employee;
};
