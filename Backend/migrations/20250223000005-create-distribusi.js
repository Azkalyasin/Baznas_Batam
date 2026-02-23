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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('distribusi', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      mustahiq_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'mustahiq', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      no_reg_bpp:    { type: Sequelize.STRING(12) },
      nrm:           { type: Sequelize.STRING(24) },
      nama_mustahik: { type: Sequelize.STRING(200), allowNull: false },
      nik:           { type: Sequelize.STRING(20) },
      alamat:        { type: Sequelize.TEXT },
      kelurahan:     { type: Sequelize.ENUM(...KELURAHAN_ENUM) },
      kecamatan:     { type: Sequelize.ENUM(...KECAMATAN_ENUM) },
      no_hp:         { type: Sequelize.STRING(20) },
      tanggal:       { type: Sequelize.DATEONLY, allowNull: false },
      bulan:         { type: Sequelize.STRING(20) },
      tahun:         { type: Sequelize.INTEGER },
      program_kegiatan: {
        type: Sequelize.ENUM(
          'B. Nafkah Rutin', 'B. Biaya Hidup Sehari-hari', 'B. Zakat Fitrah (Sembako)',
          'B. Zakat Fitrah (Uang)', 'B. Pemulangan Ibnusabil', 'B. Qurban',
          'B. Rumah Layak Huni Asnaf Miskin', 'B. Rumah Layak Huni Asnaf Fakir',
          'B. Alat Kesehatan', 'Respon Darurat Bencana', 'B. Zakat Fitrah Ramadhan',
          'B. Paket Sembako', 'B. Paket Sembako Ramadhan', 'B. Tunggakan SD',
          'B. Tunggakan SMP', 'B. Masuk SD', 'B. Masuk SMP', 'B. Beasiswa SD',
          'B. Beasiswa SMP', 'B. Pembayaran Hutang', 'B. Berobat', 'B. Operasi',
          'B. Muallaf', 'B. Dai', 'B. Bibir Sumbing', 'B. Katarak', 'Gaji RSB',
          'Operasional RSB', 'Kegiatan Program RSB', 'B. Sumur Air Bor', 'B. Sanitasi',
          'B. Penyaluran Infak', 'B. Modal Usaha UMKM', 'B. Pemberdayaan',
          'B. Jaga Kiyai', 'B. Duta Baznas', 'B. Sinergi Dakwah', 'B. Pendidikan SD dan SMP',
          'Santunan Meninggal'
        )
      },
      nama_sub_program: {
        type: Sequelize.ENUM(
          'Bantuan Makanan Asnaf Fakir', 'B. Penyaluran Zakat Fitrah Asnaf Fakir',
          'B. Penyaluran Zakat Fitrah Asnaf Miskin', 'B. Penyaluran Qurban',
          'B. Rumah Tinggal Layak Huni', 'B. Alat Kesehatan Asnaf Miskin',
          'Respon Darurat Bencana| Infak/Sedekah', 'B. Kekurangan Dana Amil Asnaf Sabilillah',
          'B. Program Pembinaan, Pendampingan Muallaf', 'B. Syiar Dakwah',
          'B. Kafalah/Mukafaah Dai', 'B. Pengobatan | Infak Sedekah Tidak Terikat',
          'B. Pendidikan Dasar dan Menengah', 'B. Pendidikan Tinggi Dalam Negeri',
          'B. Pendidikan Tinggi Luar Negeri', 'B. Pendidikan Diniyah',
          'B. Infrastruktur Pendidikan', 'B. Beasiswa Pendidikan Dasar dan Menengah',
          'B. Beasiswa Pendidikan Tinggi Dalam Negeri', 'B. Pengobatan',
          'B. Asuransi Kesehatan', 'B. Transportasi dan/atau Akomodasi Pasien',
          'B. Sanitasi', 'B. Sumur Air', 'B. Operasional Fasilitas Kesehatan',
          'B. Infrastruktur Fasilitas Kesehatan', 'B. Edukasi/Promosi Kesehatan',
          'B. Program Rumah Sehat BAZNAS', 'B. Sunatan Masal', 'B. Program Stunting',
          'B. Khitanan Masal', 'B. Makanan', 'B. Biaya Hidup', 'B. Penyaluran Fitrah',
          'B. Penyaluran Kurban', 'B. Rumah Singgah', 'B. Pengurangan Risiko Bencana',
          'B. Respon Darurat Bencana', 'B. Pemulihan Pasca Bencana',
          'B. Pemulasaran Jenazah', 'B. Kemanusiaan', 'B. Musafir',
          'B. Dana Kegiatan Sosial, Keagamaan, dan Kemanusiaan', 'B. Modal Usaha',
          'B. Pengembangan Usaha', 'B. Pengembangan Pemasaran Usaha',
          'B. Keterampilan Kerja', 'B. Infrastruktur Pelatihan Keterampilan Kerja/Usaha',
          'B. Program Zakat Community Development',
          'B. Program Pemberdayaan Peternak (Balai Ternak)',
          'B. Program Pemberdayaan Petani (Lumbung Pangan)',
          'B. Program Pemberdayaan Retail (ZMart)',
          'B. Program Pemberdayaan Retail Pangan (ZChicken)',
          'B. Program Pemberdayaan Retail Bengkel (Z-Auto)',
          'B. Pembiayaan Zakat Mikro', 'B. Santripreneur',
          'B. Program Pemberdayaan Retail (Z-Laundry)',
          'B. Sarana Dakwah/Perlengkapan Ibadah/Renovasi tempat Ibadah',
          'B. Program Advokasi/Bantuan Hukum'
        )
      },
      frekuensi_bantuan: { type: Sequelize.ENUM('Rutin', 'Tidak Rutin') },
      jumlah:   { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      quantity: { type: Sequelize.INTEGER },
      via: {
        type: Sequelize.ENUM(
          'Cash', 'Mandiri', 'BRI', 'BNI', 'BTN', 'BCA',
          'CIMB Niaga', 'Danamon', 'PermataBank', 'Panin Bank',
          'OCBC NISP', 'Maybank', 'Bank Mega', 'Sinarmas', 'BTPN',
          'UOB', 'HSBC', 'DBS', 'Standard Chartered', 'BSI', 'Bank Muamalat'
        )
      },
      kategori_mustahik: { type: Sequelize.ENUM('Individu', 'Kelompok') },
      nama_program: {
        type: Sequelize.ENUM('Batam Cerdas', 'Batam Sehat', 'Batam Makmur', 'Batam Peduli', 'Batam Taqwa')
      },
      asnaf: {
        type: Sequelize.ENUM('Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin', 'Ibnu Sabil', 'Fisabillillah', 'Riqob')
      },
      infak: { type: Sequelize.ENUM('Infak Terikat', 'Infak Tidak Terikat') },
      jenis_zis: {
        type: Sequelize.ENUM('Zakat', 'Zakat Fitrah', 'Infak Terikat', 'Infak Tidak Terikat', 'Hibah')
      },
      keterangan:      { type: Sequelize.TEXT },
      rekomendasi_upz: { type: Sequelize.TEXT },
      no_rekening:     { type: Sequelize.STRING(50) },
      created_by:      { type: Sequelize.INTEGER },
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

    await queryInterface.addIndex('distribusi', ['mustahiq_id']);
    await queryInterface.addIndex('distribusi', ['nrm']);
    await queryInterface.addIndex('distribusi', ['nik']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('distribusi');
  }
};
