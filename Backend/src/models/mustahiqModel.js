import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/database.js';
import { registerAuditHooks } from '../utils/auditHooks.js';

const Mustahiq = db.define('mustahiq', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  no_reg_bpp: {
    type: DataTypes.STRING(12),
    allowNull: false,
  },
  nrm: {
    type: DataTypes.STRING(24),
    allowNull: false,
  },
  nik: {
    type: DataTypes.STRING(16),
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  no_hp: {
    type: DataTypes.STRING(14)
  },
  alamat: {
    type: DataTypes.TEXT
  },
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
    ),
    allowNull: false
  },
  kecamatan: {
    type: DataTypes.ENUM(
      'Batu Aji', 'Sagulung', 'Sekupang', 'Batam Kota', 'Sei Beduk',
      'Bengkong', 'Lubuk Baja', 'Nongsa', 'Batu Ampar', 'Belakang Padang',
      'Bulang', 'Galang'
    ),
    allowNull: false
  },
  kategori_mustahiq: {
    type: DataTypes.ENUM('Individu', 'Kelompok'),
    defaultValue: 'Individu'
  },
  jenis_program: {
    type: DataTypes.ENUM(
        'B. Pendidikan Dasar dan Menengah',
        'B. Pendidikan Tinggi Dalam Negeri',
        'B. Pendidikan Tinggi Luar Negeri',
        'B. Pendidikan Diniyah',
        'B. Infrastruktur Pendidikan',
        'B. Beasiswa Pendidikan Dasar dan Menengah',
        'B. Beasiswa Pendidikan Tinggi Dalam Negeri',
        'B. Pengobatan',
        'B. Asuransi Kesehatan',
        'B. Transportasi dan/atau Akomodasi Pasien',
        'B. Sanitasi',
        'B. Sumur Air',
        'B. Operasional Fasilitas Kesehatan',
        'B. Infrastruktur Fasilitas Kesehatan',
        'B. Edukasi/Promosi Kesehatan',
        'B. Program Rumah Sehat BAZNAS',
        'B. Sunatan Masal',
        'B. Program Stunting',
        'B. Khitanan Masal',
        'B. Alat Kesehatan Asnaf Miskin',
        'B. Pengobatan | Infak Sedekah Tidak Terikat',
        'B. Modal Usaha',
        'B. Pengembangan Usaha',
        'B. Pengembangan Pemasaran Usaha',
        'B. Keterampilan Kerja',
        'B. Infrastruktur Pelatihan Keterampilan Kerja/Usaha',
        'B. Program Zakat Community Development',
        'B. Program Pemberdayaan Peternak (Balai Ternak)',
        'B. Program Pemberdayaan Petani (Lumbung Pangan)',
        'B. Program Pemberdayaan Retail (ZMart)',
        'B. Program Pemberdayaan Retail Pangan (ZChicken)',
        'B. Program Pemberdayaan Retail Bengkel (Z-Auto)',
        'B. Pembiayaan Zakat Mikro',
        'B. Santripreneur',
        'B. Program Pemberdayaan Retail (Z-Laundry)',
        'B. Bantuan Makanan Asnaf Fakir',
        'B. Penyaluran Zakat Fitrah Asnaf Fakir',
        'B. Penyaluran Zakat Fitrah Asnaf Miskin',
        'B. Penyaluran Qurban',
        'B. Rumah Tinggal Layak Huni',
        'B. Makanan',
        'B. Biaya Hidup',
        'B. Penyaluran Fitrah',
        'B. Penyaluran Kurban',
        'B. Rumah Singgah',
        'B. Pengurangan Risiko Bencana',
        'B. Respon Darurat Bencana',
        'B. Pemulihan Pasca Bencana',
        'B. Pemulasaran Jenazah',
        'B. Kemanusiaan',
        'B. Musafir',
        'B. Dana Kegiatan Sosial, Keagamaan, dan Kemanusiaan',
        'Respon Darurat Bencana| Infak/Sedekah',
        'B. Kekurangan Dana Amil Asnaf Sabilillah',
        'B. Program Pembinaan, Pendampingan Muallaf',
        'B. Syiar Dakwah',
        'B. Kafalah/Mukafaah Dai',
        'B. Sarana Dakwah/Perlengkapan Ibadah/Renovasi tempat Ibadah',
        'B. Program Advokasi/Bantuan Hukum'
    )
  },
  asnaf: {
    type: DataTypes.ENUM(
      'Fakir', 'Miskin', 'Amil', 'Muallaf', 'Riqob',
      'Gharimin', 'Fisabillillah', 'Ibnu Sabil'
    ),
    allowNull: false
  },
  rekomendasi_upz: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blacklist'),
    defaultValue: 'active'
  },
  total_penerimaan_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_penerimaan_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  last_received_date: {
    type: DataTypes.DATEONLY
  },
  keterangan: {
    type: DataTypes.TEXT
  },
  registered_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  registered_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  freezeTableName: true,
  indexes: [
    { unique: true, fields: ['no_reg_bpp'], name: 'no_reg_bpp_unique' },
    { unique: true, fields: ['nrm'], name: 'nrm_unique' },
    { unique: true, fields: ['nik'], name: 'nik_unique' }
  ]
});

registerAuditHooks(Mustahiq, 'mustahiq');

export default Mustahiq;
