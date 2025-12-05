'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';
import { loginSchema } from '@/lib/utils/validators';
import { login as loginUser } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setError, error } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Clear error on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await loginUser(data);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result.user) {
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('current-user', JSON.stringify(result.user));
      }
      
      // Check if user needs to change password
      if ((result.user as any).requirePasswordChange || result.user.force_password_change) {
        router.push('/change-password');
        setIsLoading(false);
        return;
      }
      
      // Update streak on login (only once per day)
      try {
        const lastStreakUpdate = localStorage.getItem('last-streak-update');
        const today = new Date().toDateString();
        
        if (lastStreakUpdate !== today) {
          await useAuthStore.getState().updateStreak(result.user.id);
          localStorage.setItem('last-streak-update', today);
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
      
      router.push('/dashboard');
    }

    setIsLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <header className="flex-none pt-12 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-mavi-navy rounded-2xl flex items-center justify-center shadow-xl shadow-mavi-navy/20 mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mavi Fit Game</h1>
          <p className="text-gray-500 text-sm mt-1">Hesabına giriş yap</p>
        </motion.div>
      </header>

      {/* Login Form */}
      <section className="flex-1 px-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                {...register('username')}
                type="text"
                id="username"
                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
                placeholder="Kullanıcı adını gir"
              />
            </div>
            {errors.username && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.username.message}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full h-14 pl-12 pr-12 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
                placeholder="Şifreni gir"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            </motion.div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-mavi-navy text-white font-semibold rounded-2xl shadow-lg shadow-mavi-navy/20 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100 mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Giriş yapılıyor...</span>
              </div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </motion.form>
      </section>

      {/* Register Link */}
      <footer className="flex-none py-8 px-6">
        <p className="text-center text-gray-500 mb-4">
          Hesabın yok mu?{' '}
          <a href="/register" className="text-mavi-navy font-semibold hover:underline">
            Kayıt Ol
          </a>
        </p>
        <p className="text-center text-gray-400 text-sm">
          Bilecik Bozüyük
        </p>
      </footer>
    </main>
  );
}
