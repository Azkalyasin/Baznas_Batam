'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('ref_kecamatan', [
      { nama: 'Batu Aji' },
      { nama: 'Sagulung' },
      { nama: 'Sekupang' },
      { nama: 'Batam Kota' },
      { nama: 'Sei Beduk' },
      { nama: 'Bengkong' },
      { nama: 'Lubuk Baja' },
      { nama: 'Nongsa' },
      { nama: 'Batu Ampar' },
      { nama: 'Belakang Padang' },
      { nama: 'Bulang' },
      { nama: 'Galang' }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ref_kecamatan', null, {});
  }
};
