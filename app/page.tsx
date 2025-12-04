'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    } else if (!isLoading) {
      // If not authenticated and not loading, redirect to login
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-mavi-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Yükleniyor...</p>
      </div>
    </main>
  );
}
