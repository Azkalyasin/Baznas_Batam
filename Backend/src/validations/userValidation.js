import { z } from 'zod';

// Shared Enums
const roleEnum = z.enum(['superadmin', 'pelayanan', 'pendistribusian', 'keuangan']);

// --- Auth Validations ---
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// --- User Management Validations ---
export const createUserSchema = z.object({
  username: z.string().min(3).max(15),
  password: z.string().min(6),
  nama: z.string().min(1),
  role: roleEnum
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(15).optional(),
  nama: z.string().min(1).optional(),
  role: roleEnum.optional(),
  password: z.string().min(6).optional() // Password optional on update
});

export const queryUserSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  role: roleEnum.optional(),
  search: z.string().optional()
});
