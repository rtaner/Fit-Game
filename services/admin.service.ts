import { createClient } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/database.types';
import {
  generateTemporaryPassword,
  generateResetToken,
  getTokenExpiration,
} from '@/lib/utils/password-reset';

export interface UserWithStore extends User {
  store_name: string;
  city: string | null;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'employee' | 'admin' | 'store_manager';
  storeCode?: number;
}

export interface UserListResponse {
  users: UserWithStore[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TemporaryPasswordResponse {
  temporaryPassword: string;
  userId: string;
  username: string;
}

export interface ResetTokenResponse {
  resetToken: string;
  expiresAt: string;
  userId: string;
  username: string;
}

/**
 * Get paginated user list with filters
 */
export async function getUserList(
  params: UserListParams
): Promise<UserListResponse> {
  const supabase = createClient();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  // Build query - get users first
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });

  // Apply filters
  if (params.search) {
    query = query.or(
      `username.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
    );
  }

  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.storeCode) {
    query = query.eq('store_code', params.storeCode);
  }

  // Apply pagination and ordering
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  // Get store information for each user
  const users: UserWithStore[] = await Promise.all(
    (data || []).map(async (user: any) => {
      const { data: store } = await supabase
        .from('stores')
        .select('store_name, city')
        .eq('store_code', user.store_code)
        .single();

      return {
        ...user,
        store_name: store?.store_name || 'Bilinmiyor',
        city: store?.city || null,
      };
    })
  );

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    users,
    total,
    page,
    totalPages,
  };
}

/**
 * Generate temporary password for user
 */
export async function generateTemporaryPasswordForUser(
  userId: string
): Promise<TemporaryPasswordResponse> {
  const supabase = createClient();

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Hash password
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  // Update user with new password and set force_password_change flag
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      force_password_change: true,
      reset_token: null,
      reset_token_expires: null,
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Şifre güncellenemedi');
  }

  return {
    temporaryPassword,
    userId: user.id,
    username: user.username,
  };
}

/**
 * Generate reset token for user
 */
export async function generateResetTokenForUser(
  userId: string
): Promise<ResetTokenResponse> {
  const supabase = createClient();

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Generate reset token and expiration
  const resetToken = generateResetToken();
  const expiresAt = getTokenExpiration();

  // Update user with reset token (this invalidates any previous token)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      reset_token: resetToken,
      reset_token_expires: expiresAt,
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Reset kodu oluşturulamadı');
  }

  return {
    resetToken,
    expiresAt,
    userId: user.id,
    username: user.username,
  };
}

/**
 * Delete user and all related data
 */
export async function deleteUser(
  userId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return {
      success: false,
      error: 'Kendi hesabınızı silemezsiniz',
    };
  }

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return {
      success: false,
      error: 'Kullanıcı bulunamadı',
    };
  }

  // Delete user (cascade will handle related data)
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    return {
      success: false,
      error: 'Kullanıcı silinemedi',
    };
  }

  return {
    success: true,
  };
}

/**
 * Validate admin authorization
 * Returns user role if authorized, null if not
 */
export async function validateAdminAuth(userId: string): Promise<{ isAuthorized: boolean; role?: string; storeCode?: number }> {
  const supabase = createClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('role, store_code')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { isAuthorized: false };
  }

  const isAuthorized = user.role === 'admin' || user.role === 'store_manager';
  return { 
    isAuthorized, 
    role: user.role,
    storeCode: user.store_code 
  };
}
