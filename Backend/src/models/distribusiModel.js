import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/database.js';
import Mustahiq from './mustahiqModel.js';

const Distribusi = db.define('distribusi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  mustahiq_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mustahiq,
      key: 'id'
    }
  },
  // Denormalized Data (Optional/Filled by Trigger or App Logic)
  no_reg_bpp: { type: DataTypes.STRING(12) },
  nrm: { type: DataTypes.STRING(24) },
  nama_mustahik: { type: DataTypes.STRING(200), allowNull: false },
  nik: { type: DataTypes.STRING(20) },
  alamat: { type: DataTypes.TEXT },
  kelurahan: {
    type: DataTypes.ENUM(
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
    )
  },
  kecamatan: {
    type: DataTypes.ENUM(
      'Batu Aji', 'Sagulung', 'Sekupang', 'Batam Kota', 'Sei Beduk',
      'Bengkong', 'Lubuk Baja', 'Nongsa', 'Batu Ampar', 'Belakang Padang',
      'Bulang', 'Galang'
    )
  },
  no_hp: { type: DataTypes.STRING(20) },
  
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bulan: { type: DataTypes.STRING(20) },
  tahun: { type: DataTypes.INTEGER },

  program_kegiatan: {
    type: DataTypes.ENUM(
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
    type: DataTypes.ENUM(
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
        'B. Program Zakat Community Development', 'B. Program Pemberdayaan Peternak (Balai Ternak)',
        'B. Program Pemberdayaan Petani (Lumbung Pangan)', 'B. Program Pemberdayaan Retail (ZMart)',
        'B. Program Pemberdayaan Retail Pangan (ZChicken)', 'B. Program Pemberdayaan Retail Bengkel (Z-Auto)',
        'B. Pembiayaan Zakat Mikro', 'B. Santripreneur', 'B. Program Pemberdayaan Retail (Z-Laundry)',
        'B. Sarana Dakwah/Perlengkapan Ibadah/Renovasi tempat Ibadah',
        'B. Program Advokasi/Bantuan Hukum'
    )
  },
  
  frekuensi_bantuan: {
    type: DataTypes.ENUM('Rutin', 'Tidak Rutin')
  },
  
  jumlah: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  quantity: { type: DataTypes.INTEGER },
  
  via: {
    type: DataTypes.ENUM(
      'Cash', 'Mandiri', 'BRI', 'BNI', 'BTN', 'BCA', 
      'CIMB Niaga', 'Danamon', 'PermataBank', 'Panin Bank', 
      'OCBC NISP', 'Maybank', 'Bank Mega', 'Sinarmas', 'BTPN', 
      'UOB', 'HSBC', 'DBS', 'Standard Chartered', 'BSI', 'Bank Muamalat'
    )
  },
  kategori_mustahik: { type: DataTypes.ENUM('Individu', 'Kelompok') },
  
  nama_program: {
    type: DataTypes.ENUM(
      'Batam Cerdas', 'Batam Sehat', 'Batam Makmur', 'Batam Peduli', 'Batam Taqwa'
    )
  },
  
  asnaf: {
    type: DataTypes.ENUM(
      'Fakir', 'Miskin', 'Amil', 'Muallaf', 
      'Gharimin', 'Ibnu Sabil', 'Fisabillillah', 'Riqob'
    )
  },
  
  infak: { type: DataTypes.ENUM('Infak Terikat', 'Infak Tidak Terikat') },
  jenis_zis: {
    type: DataTypes.ENUM(
      'Zakat', 'Zakat Fitrah', 'Infak Terikat', 'Infak Tidak Terikat', 'Hibah'
    )
  },
  
  keterangan: { type: DataTypes.TEXT },
  rekomendasi_upz: { type: DataTypes.TEXT },
  no_rekening: { type: DataTypes.STRING(50) },
  
  created_by: { type: DataTypes.INTEGER }
}, {
  freezeTableName: true,
  indexes: [
      { fields: ['mustahiq_id'] },
      { fields: ['nrm'] },
      { fields: ['nik'] }
  ]
});

// Define Relation
// Mustahiq.hasMany(Distribusi, { foreignKey: 'mustahiq_id' });
// Distribusi.belongsTo(Mustahiq, { foreignKey: 'mustahiq_id' });

export default Distribusi;
