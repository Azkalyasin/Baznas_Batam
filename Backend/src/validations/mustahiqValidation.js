import { z } from 'zod';
import { idParamSchema } from './shared.js';

// --- Shared Enums ---
const statusEnum = z.enum(['active', 'inactive', 'blacklist']);

// idParamSchema di-import dari shared.js
export { idParamSchema };
  
// --- Create Mustahiq ---
export const createMustahiqSchema = z.object({
  nrm: z.string().min(1, 'NRM wajib diisi.').max(24, 'NRM terlalu panjang.').trim(),
  nik: z.string().max(16, 'NIK maksimal 16 karakter.').trim().optional(),
  nama: z.string().min(1, 'Nama wajib diisi.').max(100, 'Nama terlalu panjang.').trim(),
  no_hp: z.string().max(14, 'Nomor HP terlalu panjang.').trim().optional(),
  alamat: z.string().optional(),
  kelurahan_id: z.number().int().positive(),
  kecamatan_id: z.number().int().positive(),
  kategori_mustahiq_id: z.number().int().positive().optional(),
  asnaf_id: z.number().int().positive(),
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
  kelurahan_id: z.number().int().positive().optional(),
  kecamatan_id: z.number().int().positive().optional(),
  kategori_mustahiq_id: z.number().int().positive().optional(),
  asnaf_id: z.number().int().positive().optional(),
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
  asnaf_id: z.string().optional(),
  kategori_mustahiq_id: z.string().optional(),
  status: statusEnum.optional(),
  kelurahan_id: z.string().optional(),
  kecamatan_id: z.string().optional(),
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
  asnaf_id: z.string().optional(),
  status: statusEnum.optional(),
  kecamatan_id: z.string().optional()
});
