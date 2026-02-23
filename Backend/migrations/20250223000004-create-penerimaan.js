'use strict';

const JENIS_UPZ_ENUM = [
  'Individu', 'Instansi', 'Sekolah', 'Masjid', 'Perusahaan',
  'Kantor', 'Majelis Taklim', 'TPQ', 'Universitas',
  'Rumah Makan / Warung / Komunitas', 'Dai', 'BKMT',
  'BP BATAM', 'KEMENAG', 'PMB', 'ASN PEMKO', 'BMGQ', 'IPIM',
  'DPRD', 'UMKM', 'BKPRMI', 'Guru Swasta', 'BANK', 'DMI',
  'BAZNAS Batam', 'HBMI'
];

const JENIS_ZIS_ENUM = [
  'Zakat', 'Infak Terikat', 'Infak Tidak Terikat', 'Zakat Fitrah',
  'Fidyah', 'Infak Kifarat', 'Hibah', 'Infak Kenclengan',
  'Infak Voucher', 'Infak Smart 5000', 'Infak Indonesia Peduli',
  'DSKL', 'CSR', 'Infak Sembako', 'Infak Quran',
  'Infak Khitan', 'Infak Santri', 'Zakat Perdagangan',
  'Zakat Emas', 'Zakat Simpanan', 'Infak Seribu',
  'Infak Palestina', 'Infak Kurban', 'Infak Jumat',
  'Infak Sumur Bor', 'Infak Pendidikan', 'Infak Subuh',
  'Infak Lebaran', 'Infak Z-volt', 'Infak Renovasi Masjid/Musholla/TPQ',
  'Infak Perahu Dakwah'
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penerimaan', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      muzakki_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'muzakki', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      npwz:         { type: Sequelize.STRING(20) },
      nama_muzakki: { type: Sequelize.STRING(150), allowNull: false },
      nik_muzakki:  { type: Sequelize.STRING(20) },
      no_hp_muzakki:{ type: Sequelize.STRING(14) },
      jenis_muzakki:{ type: Sequelize.ENUM('Individu', 'Entitas') },
      jenis_upz:    { type: Sequelize.ENUM(...JENIS_UPZ_ENUM) },
      tanggal:      { type: Sequelize.DATEONLY, allowNull: false },
      bulan:        { type: Sequelize.STRING(20) },
      tahun:        { type: Sequelize.INTEGER },
      via: {
        type: Sequelize.ENUM('Cash', 'Bank', 'Kantor Digital'),
        allowNull: false
      },
      metode_bayar: {
        type: Sequelize.ENUM(
          'Cash', 'Bank Mandiri', 'Bank Riau Kepri', 'Bank Riau Syariah',
          'Bank BNI', 'Bank BSI 2025', 'BTN Syariah Zakat', 'BTN Syariah Infak',
          'Bank Muamalat', 'BSI Zakat', 'BSI Infaq', 'Bank BRI',
          'Bank BRI Syariah', 'Bank OCBC Syariah', 'Bank BCA'
        )
      },
      no_rekening:  { type: Sequelize.STRING(50) },
      zis: {
        type: Sequelize.ENUM('Zakat', 'Infaq'),
        allowNull: false
      },
      jenis_zis: { type: Sequelize.ENUM(...JENIS_ZIS_ENUM), allowNull: false },
      jumlah:    { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      persentase_amil: {
        type: Sequelize.ENUM('0.00%', '5%', '7.50%', '12.50%', '20%', '100%'),
        allowNull: false
      },
      dana_amil:   { type: Sequelize.DECIMAL(15, 2) },
      dana_bersih: { type: Sequelize.DECIMAL(15, 2) },
      keterangan:     { type: Sequelize.TEXT },
      rekomendasi_upz:{ type: Sequelize.TEXT },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
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

    await queryInterface.addIndex('penerimaan', ['muzakki_id']);
    await queryInterface.addIndex('penerimaan', ['npwz']);
    await queryInterface.addIndex('penerimaan', ['tanggal']);
    await queryInterface.addIndex('penerimaan', ['jenis_zis']);
    await queryInterface.addIndex('penerimaan', ['via']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('penerimaan');
  }
};
