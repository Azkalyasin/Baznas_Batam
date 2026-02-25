import { z } from 'zod';
import { idParamSchema } from './shared.js';

export const createDistribusiSchema = z.object({
  mustahiq_id: z.number().int().positive(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  program_kegiatan_id: z.number().int().positive().optional(),
  sub_program_id: z.number().int().positive().optional(),
  nama_program_id: z.number().int().positive().optional(),
  frekuensi_bantuan_id: z.number().int().positive().optional(),
  jumlah: z.number().positive(),
  quantity: z.number().int().nonnegative().optional(),
  via_id: z.number().int().positive().optional(),
  kategori_mustahiq_id: z.number().int().positive().optional(),
  infak_id: z.number().int().positive().optional(),
  jenis_zis_distribusi_id: z.number().int().positive().optional(),
  no_rekening: z.string().max(50).optional(),
  rekomendasi_upz: z.string().optional(),
  keterangan: z.string().optional()
});

export const updateDistribusiSchema = createDistribusiSchema.partial();

export const queryDistribusiSchema = z.object({
  q: z.string().optional(),
  mustahiq_id: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bulan: z.string().optional(),
  tahun: z.string().optional(),
  nama_program_id: z.string().optional(),
  program_kegiatan_id: z.string().optional(),
  sub_program_id: z.string().optional(),
  asnaf_id: z.string().optional(),
  jenis_zis_distribusi_id: z.string().optional(),
  via_id: z.string().optional(),
  frekuensi_bantuan_id: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().transform(Number),
  limit: z.string().regex(/^\d+$/).optional().transform(Number)
});

export { idParamSchema };
