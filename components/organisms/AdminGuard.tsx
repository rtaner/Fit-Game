'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Try to restore user from localStorage if not in store
    if (!user) {
      const stored = localStorage.getItem('current-user');
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          setIsChecking(false);
          return;
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      router.push('/login');
      return;
    }

    // Allow both admin and store_manager
    if (user.role !== 'admin' && user.role !== 'store_manager') {
      router.push('/dashboard');
      return;
    }

    setIsChecking(false);
  }, [user, router, setUser]);

  if (isChecking || !user || (user.role !== 'admin' && user.role !== 'store_manager')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yetki kontrol ediliyor...</div>
      </div>
    );
  }

  return <>{children}</>;
}
