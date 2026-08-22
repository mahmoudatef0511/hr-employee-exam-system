const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class HR extends Model {
    async validatePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
    }

    toSafeJSON() {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        type: 'hr'
      };
    }
  }

  HR.init(
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
      // Stores the currently valid refresh token (hashed) for this account.
      // Wiping this value on logout invalidates the refresh token.
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'refresh_token'
      }
    },
    {
      sequelize,
      modelName: 'HR',
      tableName: 'hrs',
      hooks: {
        beforeCreate: async (hr) => {
          hr.password = await bcrypt.hash(hr.password, 10);
        },
        beforeUpdate: async (hr) => {
          if (hr.changed('password')) {
            hr.password = await bcrypt.hash(hr.password, 10);
          }
        }
      }
    }
  );

  return HR;
};
