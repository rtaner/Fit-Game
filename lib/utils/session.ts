import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types/database.types';

/**
 * Get current user from session (server-side)
 */
export async function getCurrentUserFromSession(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return null;
    }

    const user = JSON.parse(userCookie.value) as User;
    return user;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
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
 * Get store filter for analytics (returns storeId for store_manager, undefined for admin)
 */
export function getStoreFilterForUser(user: User | null): string | undefined {
  if (!user) return undefined;
  
  // Admin can see all stores
  if (user.role === 'admin') {
    return undefined;
  }
  
  // Store manager can only see their own store
  if (user.role === 'store_manager') {
    return user.store_code.toString();
  }
  
  return undefined;
}
