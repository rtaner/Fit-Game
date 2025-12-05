import { createClient } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/database.types';

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  storeCode: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

/**
 * Register a new user (client-side)
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        user: null,
        error: result.error?.message || 'Kayıt başarısız',
      };
    }

    return {
      user: result.data,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: 'Bağlantı hatası',
    };
  }
}

/**
 * Register a new user (server-side - for API route)
 */
export async function registerServer(data: RegisterData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .single();

    if (existingUser) {
      return {
        user: null,
        error: 'Bu kullanıcı adı zaten kullanılıyor',
      };
    }

    // Store code validation removed - now selected from dropdown

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user with initial streak of 1 (first day)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        password_hash: passwordHash,
        store_code: data.storeCode,
        role: 'employee',
        current_streak: 1,
        longest_streak: 1,
        last_login_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        user: null,
        error: 'Kayıt sırasında bir hata oluştu',
      };
    }

    return {
      user: newUser,
      error: null,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      user: null,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}

/**
 * Login user (client-side)
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        user: null,
        error: result.error?.message || 'Giriş başarısız',
      };
    }

    return {
      user: result.data,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: 'Bağlantı hatası',
    };
  }
}

/**
 * Login user (server-side - for API route)
 */
export async function loginServer(data: LoginData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', data.username)
      .single();

    if (error || !user) {
      return {
        user: null,
        error: 'Kullanıcı adı veya şifre hatalı',
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

    if (!isValidPassword) {
      return {
        user: null,
        error: 'Kullanıcı adı veya şifre hatalı',
      };
    }

    // Update last login date
    await supabase
      .from('users')
      .update({ last_login_date: new Date().toISOString().split('T')[0] })
      .eq('id', user.id);

    // Return user (force_password_change will be checked in the login route)
    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      user: null,
      error: 'Giriş sırasında bir hata oluştu',
    };
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    
    // In a real implementation, this would check the session
    // For now, we'll return null
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  // In a real implementation, this would clear the session
  // For now, we'll just return
  return;
}

export interface ResetPasswordWithTokenData {
  username: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(
  data: ResetPasswordWithTokenData
): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // Get user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', data.username)
      .single();

    if (userError || !user) {
      return {
        user: null,
        error: 'Kullanıcı bulunamadı',
      };
    }

    // Validate reset token
    if (!user.reset_token || user.reset_token !== data.resetToken) {
      return {
        user: null,
        error: 'Geçersiz reset kodu',
      };
    }

    // Check if token is expired
    if (!user.reset_token_expires) {
      return {
        user: null,
        error: 'Reset kodu bulunamadı',
      };
    }

    const now = new Date();
    const expiration = new Date(user.reset_token_expires);

    if (now > expiration) {
      return {
        user: null,
        error: 'Reset kodunun süresi dolmuş',
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        force_password_change: false,
      })
      .eq('id', user.id);

    if (updateError) {
      return {
        user: null,
        error: 'Şifre güncellenemedi',
      };
    }

    return {
      user: null,
      error: null,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      user: null,
      error: 'Şifre sıfırlama sırasında bir hata oluştu',
    };
  }
}

/**
 * Change password (for forced password change)
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.userId)
      .single();

    if (userError || !user) {
      return {
        user: null,
        error: 'Kullanıcı bulunamadı',
      };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      data.currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      return {
        user: null,
        error: 'Mevcut şifre hatalı',
      };
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      user.password_hash
    );

    if (isSamePassword) {
      return {
        user: null,
        error: 'Yeni şifre mevcut şifreden farklı olmalıdır',
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    // Update password and clear force_password_change flag
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        force_password_change: false,
      })
      .eq('id', user.id);

    if (updateError) {
      return {
        user: null,
        error: 'Şifre güncellenemedi',
      };
    }

    return {
      user: null,
      error: null,
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      user: null,
      error: 'Şifre değiştirme sırasında bir hata oluştu',
    };
  }
}

/**
 * Check if user needs to change password
 */
export async function checkForcePasswordChange(
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('force_password_change')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return false;
    }

    return user.force_password_change || false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user is store manager
 */
export function isStoreManager(user: User | null): boolean {
  return user?.role === 'store_manager';
}

/**
 * Check if user has analytics access (admin or store_manager)
 */
export function hasAnalyticsAccess(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'store_manager';
}

/**
 * Check if user is employee
 */
export function isEmployee(user: User | null): boolean {
  return user?.role === 'employee';
}
