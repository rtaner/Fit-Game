import { z } from 'zod';

/**
 * Validates store code is between 1500-1900 inclusive
 */
export function validateStoreCode(code: number): boolean {
  return Number.isInteger(code) && code >= 1500 && code <= 1900;
}

/**
 * Zod schema for store code validation
 */
export const storeCodeSchema = z
  .number()
  .int()
  .min(1500, 'Mağaza kodu en az 1500 olmalıdır')
  .max(1900, 'Mağaza kodu en fazla 1900 olmalıdır');

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
