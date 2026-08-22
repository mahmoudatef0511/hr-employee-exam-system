'use strict';

// The final score is now normalized to a fixed 0-5 scale and can be
// fractional (e.g. 3.5), so the column needs decimal precision instead of
// a plain integer.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('submissions', 'score', {
      type: Sequelize.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 0
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('submissions', 'score', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};
