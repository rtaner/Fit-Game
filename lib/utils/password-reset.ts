/**
 * Utility functions for password reset and token generation
 * Used by admin user management system
 */

/**
 * Generate a secure temporary password
 * Requirements: 8 characters, contains uppercase, lowercase, and digit
 * 
 * @returns A randomly generated password string
 */
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const allChars = uppercase + lowercase + digits;

  // Ensure at least one of each required character type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];

  // Fill remaining 5 characters randomly
  for (let i = 0; i < 5; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Generate a 6-digit reset token
 * 
 * @returns A 6-digit numeric string
 */
export function generateResetToken(): string {
  // Generate 6 random digits
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
}

/**
 * Calculate expiration timestamp for reset token (24 hours from now)
 * 
 * @returns ISO timestamp string 24 hours in the future
 */
export function getTokenExpiration(): string {
  const now = new Date();
  const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  return expiration.toISOString();
}

/**
 * Check if a reset token has expired
 * 
 * @param expiresAt - ISO timestamp string of token expiration
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  
  const now = new Date();
  const expiration = new Date(expiresAt);
  
  return now > expiration;
}

/**
 * Validate password strength
 * Requirements: minimum 8 characters, contains uppercase, lowercase, and digit
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Şifre en az 8 karakter olmalıdır',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Şifre en az bir büyük harf içermelidir',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Şifre en az bir küçük harf içermelidir',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Şifre en az bir rakam içermelidir',
    };
  }

  return { isValid: true };
}
