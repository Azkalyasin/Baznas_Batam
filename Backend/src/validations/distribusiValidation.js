import { z } from 'zod';
import { idParamSchema } from './shared.js';

const kelurahanEnum = [
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

const kecamatanEnum = [
  'Batu Aji', 'Sagulung', 'Sekupang', 'Batam Kota', 'Sei Beduk',
  'Bengkong', 'Lubuk Baja', 'Nongsa', 'Batu Ampar', 'Belakang Padang',
  'Bulang', 'Galang'
];

const programKegiatanEnum = [
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
];

const subProgramEnum = [
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
];

const viaEnum = [
  'Cash', 'Mandiri', 'BRI', 'BNI', 'BTN', 'BCA',
  'CIMB Niaga', 'Danamon', 'PermataBank', 'Panin Bank',
  'OCBC NISP', 'Maybank', 'Bank Mega', 'Sinarmas', 'BTPN',
  'UOB', 'HSBC', 'DBS', 'Standard Chartered', 'BSI', 'Bank Muamalat'
];

const createSchema = z.object({
  mustahiq_id: z.number().int().positive(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  program_kegiatan: z.enum(programKegiatanEnum).optional(),
  nama_sub_program: z.enum(subProgramEnum).optional(),
  nama_program: z.enum(['Batam Cerdas', 'Batam Sehat', 'Batam Makmur', 'Batam Peduli', 'Batam Taqwa']).optional(),
  frekuensi_bantuan: z.enum(['Rutin', 'Tidak Rutin']).optional(),
  jumlah: z.number().positive(),
  quantity: z.number().int().nonnegative().optional(),
  via: z.enum(viaEnum).optional(),
  kategori_mustahik: z.enum(['Individu', 'Kelompok']).optional(),
  infak: z.enum(['Infak Terikat', 'Infak Tidak Terikat']).optional(),
  jenis_zis: z.enum(['Zakat', 'Zakat Fitrah', 'Infak Terikat', 'Infak Tidak Terikat', 'Hibah']).optional(),
  no_rekening: z.string().max(50).optional(),
  rekomendasi_upz: z.string().optional(),
  keterangan: z.string().optional()
});

const updateSchema = createSchema.partial();

const querySchema = z.object({
  q: z.string().optional(),
  mustahiq_id: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bulan: z.string().optional(),
  tahun: z.string().optional(),
  nama_program: z.enum(['Batam Cerdas', 'Batam Sehat', 'Batam Makmur', 'Batam Peduli', 'Batam Taqwa']).optional(),
  program_kegiatan: z.enum(programKegiatanEnum).optional(),
  nama_sub_program: z.enum(subProgramEnum).optional(),
  asnaf: z.enum(['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin', 'Ibnu Sabil', 'Fisabillillah', 'Riqob']).optional(),
  jenis_zis: z.enum(['Zakat', 'Zakat Fitrah', 'Infak Terikat', 'Infak Tidak Terikat', 'Hibah']).optional(),
  via: z.enum(viaEnum).optional(),
  frekuensi_bantuan: z.enum(['Rutin', 'Tidak Rutin']).optional(),
  page: z.string().regex(/^\d+$/).optional().transform(Number),
  limit: z.string().regex(/^\d+$/).optional().transform(Number)
});

export {
  createSchema,
  updateSchema,
  querySchema,
  idParamSchema
};
