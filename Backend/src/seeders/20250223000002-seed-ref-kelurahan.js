'use strict';

/**
 * Seeder kelurahan — menggunakan subquery nama kecamatan untuk mendapatkan ID.
 * Dipisah ke file sendiri karena data besar (65+ kelurahan) dan bergantung pada ref_kecamatan.
 * 
 * @type {import('sequelize-cli').Seeder}
 */
module.exports = {
  async up(queryInterface) {
    // Ambil mapping nama kecamatan -> id
    const [kecamatanRows] = await queryInterface.sequelize.query(
      `SELECT id, nama FROM ref_kecamatan`
    );
    const kecMap = {};
    kecamatanRows.forEach(r => { kecMap[r.nama] = r.id; });

    const kelurahan = [
      // Belakang Padang
      { nama: 'Sadai',             kecamatan_id: kecMap['Belakang Padang'] },
      { nama: 'Kasu',              kecamatan_id: kecMap['Belakang Padang'] },
      { nama: 'Pecong',            kecamatan_id: kecMap['Belakang Padang'] },
      { nama: 'Pemping',           kecamatan_id: kecMap['Belakang Padang'] },
      { nama: 'Pulau Terong',      kecamatan_id: kecMap['Belakang Padang'] },
      { nama: 'Sekanak Raya',      kecamatan_id: kecMap['Belakang Padang'] },
      // Batu Aji
      { nama: 'Tanjung Uncang',    kecamatan_id: kecMap['Batu Aji'] },
      { nama: 'Bukit Tempayan',    kecamatan_id: kecMap['Batu Aji'] },
      { nama: 'Buliang',           kecamatan_id: kecMap['Batu Aji'] },
      { nama: 'Kibing',            kecamatan_id: kecMap['Batu Aji'] },
      { nama: 'Ketileng',          kecamatan_id: kecMap['Batu Aji'] },
      { nama: 'Cilame',            kecamatan_id: kecMap['Batu Aji'] },
      // Sagulung
      { nama: 'Tembesi',           kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Sungai Pelunggut',  kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Tanjung Sari',      kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Sagulung Kota',     kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Sungai Binti',      kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Sungai Langkai',    kecamatan_id: kecMap['Sagulung'] },
      { nama: 'Sungai Lekop',      kecamatan_id: kecMap['Sagulung'] },
      // Batam Kota
      { nama: 'Belian',            kecamatan_id: kecMap['Batam Kota'] },
      { nama: 'Taman Baloi',       kecamatan_id: kecMap['Batam Kota'] },
      { nama: 'Teluk Tering',      kecamatan_id: kecMap['Batam Kota'] },
      { nama: 'Baloi Permai',      kecamatan_id: kecMap['Batam Kota'] },
      { nama: 'Sukajadi',          kecamatan_id: kecMap['Batam Kota'] },
      { nama: 'Sungai Panas',      kecamatan_id: kecMap['Batam Kota'] },
      // Batu Ampar
      { nama: 'Sungai Jodoh',      kecamatan_id: kecMap['Batu Ampar'] },
      { nama: 'Batu Merah',        kecamatan_id: kecMap['Batu Ampar'] },
      { nama: 'Kampung Seraya',    kecamatan_id: kecMap['Batu Ampar'] },
      { nama: 'Tanjung Sengkuang', kecamatan_id: kecMap['Batu Ampar'] },
      // Bengkong
      { nama: 'Bengkong Indah',    kecamatan_id: kecMap['Bengkong'] },
      { nama: 'Bengkong Laut',     kecamatan_id: kecMap['Bengkong'] },
      { nama: 'Tanjung Buntung',   kecamatan_id: kecMap['Bengkong'] },
      // Nongsa
      { nama: 'Batu Besar',        kecamatan_id: kecMap['Nongsa'] },
      { nama: 'Kabil',             kecamatan_id: kecMap['Nongsa'] },
      { nama: 'Ngenang',           kecamatan_id: kecMap['Nongsa'] },
      { nama: 'Sambau',            kecamatan_id: kecMap['Nongsa'] },
      // Bulang
      { nama: 'Setokok',           kecamatan_id: kecMap['Bulang'] },
      { nama: 'Batu Legong',       kecamatan_id: kecMap['Bulang'] },
      { nama: 'Bulang Lintang',    kecamatan_id: kecMap['Bulang'] },
      { nama: 'Pantai Gelam',      kecamatan_id: kecMap['Bulang'] },
      { nama: 'Pulau Buluh',       kecamatan_id: kecMap['Bulang'] },
      { nama: 'Temoyong',          kecamatan_id: kecMap['Bulang'] },
      // Galang
      { nama: 'Air Raja',          kecamatan_id: kecMap['Galang'] },
      { nama: 'Galang Baru',       kecamatan_id: kecMap['Galang'] },
      { nama: 'Karas',             kecamatan_id: kecMap['Galang'] },
      { nama: 'Pulau Abang',       kecamatan_id: kecMap['Galang'] },
      { nama: 'Rempang Cate',      kecamatan_id: kecMap['Galang'] },
      { nama: 'Sembulang',         kecamatan_id: kecMap['Galang'] },
      { nama: 'Sijantung',         kecamatan_id: kecMap['Galang'] },
      { nama: 'Subang Mas',        kecamatan_id: kecMap['Galang'] },
      // Lubuk Baja
      { nama: 'Baloi Indah',       kecamatan_id: kecMap['Lubuk Baja'] },
      { nama: 'Batu Selicin',      kecamatan_id: kecMap['Lubuk Baja'] },
      { nama: 'Kampung Pelita',    kecamatan_id: kecMap['Lubuk Baja'] },
      { nama: 'Lubuk Baja Kota',   kecamatan_id: kecMap['Lubuk Baja'] },
      { nama: 'Tanjung Uma',       kecamatan_id: kecMap['Lubuk Baja'] },
      // Sei Beduk
      { nama: 'Tanjung Piayu',     kecamatan_id: kecMap['Sei Beduk'] },
      { nama: 'Duriangkang',       kecamatan_id: kecMap['Sei Beduk'] },
      { nama: 'Mangsang',          kecamatan_id: kecMap['Sei Beduk'] },
      { nama: 'Muka Kuning',       kecamatan_id: kecMap['Sei Beduk'] },
      // Sekupang
      { nama: 'Patam Lestari',     kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Sungai Harapan',    kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Tanjung Pinggir',   kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Tanjung Riau',      kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Tiban Baru',        kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Tiban Indah',       kecamatan_id: kecMap['Sekupang'] },
      { nama: 'Tiban Lama',        kecamatan_id: kecMap['Sekupang'] }
    ];

    await queryInterface.bulkInsert('ref_kelurahan', kelurahan, { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ref_kelurahan', null, {});
  }
};
