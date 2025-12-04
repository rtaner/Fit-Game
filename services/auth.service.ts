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

    // Check if store code is in valid range (1500-1900)
    if (data.storeCode < 1500 || data.storeCode > 1900) {
      return {
        user: null,
        error: 'Mağaza kodu 1500-1900 arasında olmalıdır',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        password_hash: passwordHash,
        store_code: data.storeCode,
        role: 'employee',
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
