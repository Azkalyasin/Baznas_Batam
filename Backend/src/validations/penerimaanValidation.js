import { z } from 'zod';
import { idParamSchema } from './shared.js';

// --- Enums from model ---
const viaEnum = z.enum(['Cash', 'Bank', 'Kantor Digital']);
const zisEnum = z.enum(['Zakat', 'Infaq']);

const metodeBayarEnum = z.enum([
  'Cash', 'Bank Mandiri', 'Bank Riau Kepri', 'Bank Riau Syariah',
  'Bank BNI', 'Bank BSI 2025', 'BTN Syariah Zakat', 'BTN Syariah Infak',
  'Bank Muamalat', 'BSI Zakat', 'BSI Infaq', 'Bank BRI',
  'Bank BRI Syariah', 'Bank OCBC Syariah', 'Bank BCA'
]);

const jenisZisEnum = z.enum([
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
]);

const persentaseAmilEnum = z.enum(['0.00%', '5%', '7.50%', '12.50%', '20%', '100%']);

// idParamSchema di-import dari shared.js
export { idParamSchema };

// --- Create Penerimaan ---
export const createPenerimaanSchema = z.object({
  muzakki_id: z.number().int().positive('muzakki_id harus angka positif.'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD.'),
  via: viaEnum,
  metode_bayar: metodeBayarEnum.optional(),
  no_rekening: z.string().max(50).optional(),
  zis: zisEnum,
  jenis_zis: jenisZisEnum,
  jumlah: z.number().positive('Jumlah harus lebih dari 0.'),
  persentase_amil: persentaseAmilEnum,
  keterangan: z.string().optional(),
  rekomendasi_upz: z.string().optional()
});

// --- Update Penerimaan ---
export const updatePenerimaanSchema = z.object({
  muzakki_id: z.number().int().positive().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD.').optional(),
  via: viaEnum.optional(),
  metode_bayar: metodeBayarEnum.optional(),
  no_rekening: z.string().max(50).optional(),
  zis: zisEnum.optional(),
  jenis_zis: jenisZisEnum.optional(),
  jumlah: z.number().positive('Jumlah harus lebih dari 0.').optional(),
  persentase_amil: persentaseAmilEnum.optional(),
  keterangan: z.string().optional(),
  rekomendasi_upz: z.string().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimal satu field harus diisi untuk update.' }
);

// --- Query Params (GET list) ---
export const queryPenerimaanSchema = z.object({
  q: z.string().max(100).optional(),
  muzakki_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bulan: z.string().max(20).optional(),
  tahun: z.string().regex(/^\d{4}$/).transform(Number).optional(),
  via: viaEnum.optional(),
  metode_bayar: metodeBayarEnum.optional(),
  zis: zisEnum.optional(),
  jenis_zis: jenisZisEnum.optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// --- Query Params (Rekap Harian) ---
export const queryRekapHarianSchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

// --- Query Params (Rekap Bulanan) ---
export const queryRekapBulananSchema = z.object({
  bulan: z.string().max(20).optional(),
  tahun: z.string().regex(/^\d{4}$/).transform(Number).optional()
});

// --- Query Params (Rekap Tahunan) ---
export const queryRekapTahunanSchema = z.object({
  tahun: z.string().regex(/^\d{4}$/).transform(Number).optional()
});
