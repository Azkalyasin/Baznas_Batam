'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('muzakki', 'registered_date');
    await queryInterface.removeColumn('mustahiq', 'registered_date');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('muzakki', 'registered_date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });
    await queryInterface.addColumn('mustahiq', 'registered_date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });
  }
};
