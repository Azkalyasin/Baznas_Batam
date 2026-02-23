import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/database.js';
import { registerAuditHooks } from '../utils/auditHooks.js';
import Muzakki from './muzakkiModel.js';

const Penerimaan = db.define('penerimaan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  muzakki_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Muzakki,
      key: 'id'
    }
  },
  // Denormalized Data
  npwz: { type: DataTypes.STRING(20) },
  nama_muzakki: { type: DataTypes.STRING(150), allowNull: false },
  nik_muzakki: { type: DataTypes.STRING(20) },
  no_hp_muzakki: { type: DataTypes.STRING(14) },
  jenis_muzakki: { type: DataTypes.ENUM('Individu', 'Entitas') },
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

  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  bulan: { type: DataTypes.STRING(20) },
  tahun: { type: DataTypes.INTEGER },

  via: { type: DataTypes.ENUM('Cash', 'Bank', 'Kantor Digital'), allowNull: false },

  metode_bayar: {
    type: DataTypes.ENUM(
        'Cash', 'Bank Mandiri', 'Bank Riau Kepri', 'Bank Riau Syariah',
        'Bank BNI', 'Bank BSI 2025', 'BTN Syariah Zakat', 'BTN Syariah Infak',
        'Bank Muamalat', 'BSI Zakat', 'BSI Infaq', 'Bank BRI',
        'Bank BRI Syariah', 'Bank OCBC Syariah', 'Bank BCA'
    )
  },
  no_rekening: { type: DataTypes.STRING(50) },

  zis: { type: DataTypes.ENUM('Zakat', 'Infaq'), allowNull: false },
  
  jenis_zis: {
    type: DataTypes.ENUM(
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
    ),
    allowNull: false
  },

  jumlah: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  persentase_amil: {
    type: DataTypes.ENUM('0.00%', '5%', '7.50%', '12.50%', '20%', '100%'),
    allowNull: false
  },
  
  // Note: Generated Columns (dana_amil, dana_bersih) are usually best handled 
  // by logic in the application 'beforeSave' hook or database triggers in Sequelize.
  // Since we are adding SQL triggers later, we define them as normal columns here 
  // so Sequelize doesn't complain, but we let MySQL handle the values.
  dana_amil: { type: DataTypes.DECIMAL(15, 2) },
  dana_bersih: { type: DataTypes.DECIMAL(15, 2) },

  keterangan: { type: DataTypes.TEXT },
  rekomendasi_upz: { type: DataTypes.TEXT },
  
  created_by: { type: DataTypes.INTEGER, allowNull: false }

}, {
  freezeTableName: true,
  indexes: [
      { fields: ['muzakki_id'] },
      { fields: ['npwz'] },
      { fields: ['tanggal'] },
      { fields: ['jenis_zis'] },
      { fields: ['via'] }
  ]
});

// Relation defined in app.js or associations file
registerAuditHooks(Penerimaan, 'penerimaan');

export default Penerimaan;
