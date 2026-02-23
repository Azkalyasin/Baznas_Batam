import { z } from 'zod';
import { idParamSchema } from './shared.js';

// --- Shared Enums ---
const kelurahanEnum = z.enum([
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
]);

const kecamatanEnum = z.enum([
  'Batu Aji', 'Sagulung', 'Sekupang', 'Batam Kota', 'Sei Beduk',
  'Bengkong', 'Lubuk Baja', 'Nongsa', 'Batu Ampar', 'Belakang Padang',
  'Bulang', 'Galang'
]);

const asnafEnum = z.enum([
  'Fakir', 'Miskin', 'Amil', 'Muallaf', 'Riqob',
  'Gharimin', 'Fisabillillah', 'Ibnu Sabil'
]);

const kategoriEnum = z.enum(['Individu', 'Kelompok']);
const statusEnum = z.enum(['active', 'inactive', 'blacklist']);

const jenisProgramEnum = z.enum([
  'B. Pendidikan Dasar dan Menengah', 'B. Pendidikan Tinggi Dalam Negeri',
  'B. Pendidikan Tinggi Luar Negeri', 'B. Pendidikan Diniyah',
  'B. Infrastruktur Pendidikan', 'B. Beasiswa Pendidikan Dasar dan Menengah',
  'B. Beasiswa Pendidikan Tinggi Dalam Negeri', 'B. Pengobatan',
  'B. Asuransi Kesehatan', 'B. Transportasi dan/atau Akomodasi Pasien',
  'B. Sanitasi', 'B. Sumur Air', 'B. Operasional Fasilitas Kesehatan',
  'B. Infrastruktur Fasilitas Kesehatan', 'B. Edukasi/Promosi Kesehatan',
  'B. Program Rumah Sehat BAZNAS', 'B. Sunatan Masal', 'B. Program Stunting',
  'B. Khitanan Masal', 'B. Alat Kesehatan Asnaf Miskin',
  'B. Pengobatan | Infak Sedekah Tidak Terikat', 'B. Modal Usaha',
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
  'B. Bantuan Makanan Asnaf Fakir', 'B. Penyaluran Zakat Fitrah Asnaf Fakir',
  'B. Penyaluran Zakat Fitrah Asnaf Miskin', 'B. Penyaluran Qurban',
  'B. Rumah Tinggal Layak Huni', 'B. Makanan', 'B. Biaya Hidup',
  'B. Penyaluran Fitrah', 'B. Penyaluran Kurban', 'B. Rumah Singgah',
  'B. Pengurangan Risiko Bencana', 'B. Respon Darurat Bencana',
  'B. Pemulihan Pasca Bencana', 'B. Pemulasaran Jenazah', 'B. Kemanusiaan',
  'B. Musafir', 'B. Dana Kegiatan Sosial, Keagamaan, dan Kemanusiaan',
  'Respon Darurat Bencana| Infak/Sedekah',
  'B. Kekurangan Dana Amil Asnaf Sabilillah',
  'B. Program Pembinaan, Pendampingan Muallaf', 'B. Syiar Dakwah',
  'B. Kafalah/Mukafaah Dai',
  'B. Sarana Dakwah/Perlengkapan Ibadah/Renovasi tempat Ibadah',
  'B. Program Advokasi/Bantuan Hukum'
]);

// idParamSchema di-import dari shared.js
export { idParamSchema };

// --- Create Mustahiq ---
export const createMustahiqSchema = z.object({
  nrm: z.string().min(1, 'NRM wajib diisi.').max(24, 'NRM terlalu panjang.').trim(),
  nik: z.string().max(16, 'NIK maksimal 16 karakter.').trim().optional(),
  nama: z.string().min(1, 'Nama wajib diisi.').max(100, 'Nama terlalu panjang.').trim(),
  no_hp: z.string().max(14, 'Nomor HP terlalu panjang.').trim().optional(),
  alamat: z.string().optional(),
  kelurahan: kelurahanEnum,
  kecamatan: kecamatanEnum,
  kategori_mustahiq: kategoriEnum.optional().default('Individu'),
  jenis_program: jenisProgramEnum.optional(),
  asnaf: asnafEnum,
  rekomendasi_upz: z.string().optional(),
  keterangan: z.string().optional()
});

// --- Update Mustahiq ---
export const updateMustahiqSchema = z.object({
  nrm: z.string().min(1).max(24).trim().optional(),
  nik: z.string().max(16).trim().optional(),
  nama: z.string().min(1).max(100).trim().optional(),
  no_hp: z.string().max(14).trim().optional(),
  alamat: z.string().optional(),
  kelurahan: kelurahanEnum.optional(),
  kecamatan: kecamatanEnum.optional(),
  kategori_mustahiq: kategoriEnum.optional(),
  jenis_program: jenisProgramEnum.optional(),
  asnaf: asnafEnum.optional(),
  rekomendasi_upz: z.string().optional(),
  keterangan: z.string().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimal satu field harus diisi untuk update.' }
);

// --- Update Status ---
export const updateStatusSchema = z.object({
  status: statusEnum
});

// --- Query Params (GET list) ---
export const queryMustahiqSchema = z.object({
  q: z.string().max(100).optional(),
  asnaf: asnafEnum.optional(),
  kategori: kategoriEnum.optional(),
  jenis_program: jenisProgramEnum.optional(),
  status: statusEnum.optional(),
  kelurahan: kelurahanEnum.optional(),
  kecamatan: kecamatanEnum.optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// --- Query Params (GET riwayat) ---
export const queryRiwayatSchema = z.object({
  tahun: z.string().regex(/^\d{4}$/, 'Tahun harus 4 digit.').transform(Number).optional(),
  bulan: z.string().max(20).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// --- Query Params (Export) ---
export const queryExportSchema = z.object({
  asnaf: asnafEnum.optional(),
  status: statusEnum.optional(),
  kecamatan: kecamatanEnum.optional()
});
