import { z } from 'zod';

export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(15, "Username must be at most 15 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nama: z.string().min(1, "Name is required"),
  role: z.enum(['superadmin', 'pelayanan', 'pendistribusian', 'keuangan'], {
    errorMap: () => ({ message: "Role must be one of: superadmin, pelayanan, pendistribusian, keuangan" })
  })
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
