'use strict';

const KELURAHAN_ENUM = [
  'Sadai', 'Tanjung Uncang', 'Tembesi', 'Belian', 'Sungai Jodoh',
  'Bengkong Indah', 'Batu Besar', 'Taman Baloi', 'Sungai Pelunggut',
  'Setokok', 'Teluk Tering', 'Tanjung Piayu', 'Baloi Permai',
  'Sukajadi', 'Sungai Panas', 'Bukit Tempayan', 'Buliang', 'Kibing',
  'Batu Merah', 'Kampung Seraya', 'Tanjung Sengkuang', 'Kasu', 'Pecong',
  'Pemping', 'Pulau Terong', 'Sekanak Raya', 'Tanjung Sari',
  'Bengkong Laut', 'Tanjung Buntung', 'Batu Legong', 'Bulang Lintang',
  'Pantai Gelam', 'Pulau Buluh', 'Temoyong', 'Air Raja', 'Galang Baru',
  'Karas', 'Pulau Abang', 'Rempang Cate', 'Sembulang', 'Sijantung',
  'Subang Mas', 'Baloi Indah', 'Batu Selicin', 'Kampung Pelita',
  'Lubuk Baja Kota', 'Tanjung Uma', 'Kabil', 'Ngenang', 'Sambau',
  'Sagulung Kota', 'Sungai Binti', 'Sungai Langkai', 'Sungai Lekop',
  'Duriangkang', 'Mangsang', 'Muka Kuning', 'Patam Lestari',
  'Sungai Harapan', 'Tanjung Pinggir', 'Tanjung Riau', 'Tiban Baru',
  'Tiban Indah', 'Tiban Lama', 'Ketileng', 'Cilame'
];

const KECAMATAN_ENUM = [
  'Batu Aji', 'Sagulung', 'Sekupang', 'Batam Kota', 'Sei Beduk',
  'Bengkong', 'Lubuk Baja', 'Nongsa', 'Batu Ampar', 'Belakang Padang',
  'Bulang', 'Galang'
];

const JENIS_UPZ_ENUM = [
  'Individu', 'Instansi', 'Sekolah', 'Masjid', 'Perusahaan',
  'Kantor', 'Majelis Taklim', 'TPQ', 'Universitas',
  'Rumah Makan / Warung / Komunitas', 'Dai', 'BKMT',
  'BP BATAM', 'KEMENAG', 'PMB', 'ASN PEMKO', 'BMGQ', 'IPIM',
  'DPRD', 'UMKM', 'BKPRMI', 'Guru Swasta', 'BANK', 'DMI',
  'BAZNAS Batam', 'HBMI'
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('muzakki', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      npwz: { type: Sequelize.STRING(15), allowNull: false },
      nama: { type: Sequelize.STRING(50), allowNull: false },
      nik: { type: Sequelize.STRING(16) },
      no_hp: { type: Sequelize.STRING(14) },
      jenis_muzakki: {
        type: Sequelize.ENUM('Individu', 'Entitas'),
        defaultValue: 'Individu'
      },
      jenis_upz: { type: Sequelize.ENUM(...JENIS_UPZ_ENUM) },
      alamat: { type: Sequelize.TEXT },
      kelurahan: { type: Sequelize.ENUM(...KELURAHAN_ENUM), allowNull: false },
      kecamatan: { type: Sequelize.ENUM(...KECAMATAN_ENUM), allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      total_setor_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_setor_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      last_setor_date: { type: Sequelize.DATEONLY },
      keterangan: { type: Sequelize.TEXT },
      registered_by: { type: Sequelize.INTEGER, allowNull: false },
      registered_date: { type: Sequelize.DATEONLY, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('muzakki', ['npwz'], { unique: true, name: 'npwz_unique' });
    await queryInterface.addIndex('muzakki', ['nik'],  { unique: true, name: 'nik_unique'  });
    await queryInterface.addIndex('muzakki', ['nama'],               { name: 'nama_index'  });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('muzakki');
  }
};
