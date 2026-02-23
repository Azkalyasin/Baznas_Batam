import { z } from 'zod';

// --- Shared ID param schema (dipakai oleh semua route dengan :id) ---
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID harus berupa angka positif.').transform(Number)
});
