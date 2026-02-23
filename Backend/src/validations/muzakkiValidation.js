import { z } from 'zod';

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

const jenisMuzakkiEnum = z.enum(['Individu', 'Entitas']);
const statusEnum = z.enum(['active', 'inactive']);

const jenisUpzEnum = z.enum([
  'Individu', 'Instansi', 'Sekolah', 'Masjid', 'Perusahaan',
  'Kantor', 'Majelis Taklim', 'TPQ', 'Universitas',
  'Rumah Makan / Warung / Komunitas', 'Dai', 'BKMT',
  'BP BATAM', 'KEMENAG', 'PMB', 'ASN PEMKO', 'BMGQ', 'IPIM',
  'DPRD', 'UMKM', 'BKPRMI', 'Guru Swasta', 'BANK', 'DMI',
  'BAZNAS Batam', 'HBMI'
]);

// --- ID param ---
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID harus berupa angka positif.').transform(Number)
});

// --- Create Muzakki ---
export const createMuzakkiSchema = z.object({
  npwz: z.string().min(1, 'NPWZ wajib diisi.').max(15, 'NPWZ terlalu panjang.').trim(),
  nama: z.string().min(1, 'Nama wajib diisi.').max(50, 'Nama terlalu panjang.').trim(),
  nik: z.string().max(16, 'NIK maksimal 16 karakter.').trim().optional(),
  no_hp: z.string().max(14, 'Nomor HP terlalu panjang.').trim().optional(),
  jenis_muzakki: jenisMuzakkiEnum.optional().default('Individu'),
  jenis_upz: jenisUpzEnum.optional(),
  alamat: z.string().optional(),
  kelurahan: kelurahanEnum,
  kecamatan: kecamatanEnum,
  keterangan: z.string().optional()
});

// --- Update Muzakki ---
export const updateMuzakkiSchema = z.object({
  npwz: z.string().min(1).max(15).trim().optional(),
  nama: z.string().min(1).max(50).trim().optional(),
  nik: z.string().max(16).trim().optional(),
  no_hp: z.string().max(14).trim().optional(),
  jenis_muzakki: jenisMuzakkiEnum.optional(),
  jenis_upz: jenisUpzEnum.optional(),
  alamat: z.string().optional(),
  kelurahan: kelurahanEnum.optional(),
  kecamatan: kecamatanEnum.optional(),
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
export const queryMuzakkiSchema = z.object({
  q: z.string().max(100).optional(),
  jenis_muzakki: jenisMuzakkiEnum.optional(),
  jenis_upz: jenisUpzEnum.optional(),
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
  jenis_muzakki: jenisMuzakkiEnum.optional(),
  jenis_upz: jenisUpzEnum.optional(),
  status: statusEnum.optional()
});
