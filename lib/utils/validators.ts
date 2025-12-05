import { z } from 'zod';

/**
 * Validates store code is a positive integer
 * Range validation removed - stores are now selected from dropdown
 */
export function validateStoreCode(code: number): boolean {
  return Number.isInteger(code) && code > 0;
}

/**
 * Zod schema for store code validation
 */
export const storeCodeSchema = z
  .number()
  .int()
  .positive('Geçerli bir mağaza seçiniz');

/**
 * Zod schema for user registration
 */
export const registerSchema = z.object({
  firstName: z.string().min(1, 'İsim gereklidir').max(100),
  lastName: z.string().min(1, 'Soyisim gereklidir').max(100),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  storeCode: storeCodeSchema,
});

/**
 * Zod schema for user login
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gereklidir'),
  password: z.string().min(1, 'Şifre gereklidir'),
});
