import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/database.js';
import { registerAuditHooks } from '../utils/auditHooks.js';

const Muzakki = db.define('muzakki', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  npwz: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nik: {
    type: DataTypes.STRING(16),
  },
  no_hp: {
    type: DataTypes.STRING(14)
  },
  jenis_muzakki: {
    type: DataTypes.ENUM('Individu', 'Entitas'),
    defaultValue: 'Individu'
  },
  jenis_upz: {
    type: DataTypes.ENUM(
        'Individu', 'Instansi', 'Sekolah', 'Masjid', 'Perusahaan',
        'Kantor', 'Majelis Taklim', 'TPQ', 'Universitas',
        'Rumah Makan / Warung / Komunitas', 'Dai', 'BKMT',
        'BP BATAM', 'KEMENAG', 'PMB', 'ASN PEMKO', 'BMGQ', 'IPIM',
        'DPRD', 'UMKM', 'BKPRMI', 'Guru Swasta', 'BANK', 'DMI',
        'BAZNAS Batam', 'HBMI'
    )
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
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  total_setor_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_setor_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  last_setor_date: {
    type: DataTypes.DATEONLY
  },
  keterangan: {
    type: DataTypes.TEXT
  },
  registered_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  indexes: [
    { unique: true, fields: ['npwz'], name: 'npwz_unique' },
    { unique: true, fields: ['nik'],  name: 'nik_unique'  },
    { fields: ['nama'],               name: 'nama_index'  }
  ]
});

registerAuditHooks(Muzakki, 'muzakki');

export default Muzakki;
