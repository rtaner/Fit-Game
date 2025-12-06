'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Lock, ChevronLeft } from 'lucide-react';
import { z } from 'zod';
import { register as registerUser } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeService } from '@/services/store.service';
import { TermsModal } from '@/components/molecules/TermsModal';
import type { Store } from '@/types/database.types';

// Extended schema with confirmPassword and terms acceptance
const registerSchema = z.object({
  firstName: z.string().min(1, 'İsim gereklidir').max(100),
  lastName: z.string().min(1, 'Soyisim gereklidir').max(100),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-Z_]+$/, 'Kullanıcı adı sadece harf ve alt çizgi içerebilir (rakam kullanılamaz)'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  storeCode: z.number().int().positive('Mağaza seçimi gereklidir'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Kullanım şartlarını kabul etmelisiniz',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setError, error } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [selectedStoreCode, setSelectedStoreCode] = useState<number | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await storeService.getAllStores();
        setStores(storesData.filter(s => s.is_active));
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    fetchStores();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await registerUser(data);

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
      
      // Update streak for first login
      try {
        await useAuthStore.getState().updateStreak(result.user.id);
      } catch (error) {
        console.error('Error updating streak:', error);
      }
      
      router.push('/dashboard');
    }

    setIsLoading(false);
  };

  const selectedStore = stores.find(s => s.store_code === selectedStoreCode);
  
  // Filter stores based on search query
  const filteredStores = stores.filter(store => {
    const query = storeSearchQuery.toLowerCase();
    return (
      store.store_name.toLowerCase().includes(query) ||
      store.store_code.toString().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-none pt-8 pb-4 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kayıt Ol</h1>
            <p className="text-sm text-gray-500">Yeni hesap oluştur</p>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <section className="flex-1 px-6 pb-8 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                Ad
              </label>
              <input
                {...register('firstName')}
                type="text"
                id="firstName"
                placeholder="Adın"
                className="w-full h-14 px-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
              />
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {errors.firstName.message}
                </motion.p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                Soyad
              </label>
              <input
                {...register('lastName')}
                type="text"
                id="lastName"
                placeholder="Soyadın"
                className="w-full h-14 px-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
              />
              {errors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {errors.lastName.message}
                </motion.p>
              )}
            </div>
          </div>

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
                placeholder="Kullanıcı adı seç"
                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-orange-600 mt-2 flex items-start gap-1">
              <span className="flex-shrink-0">⚠️</span>
              <span>Şirket sicil kodunuzu kullanmayın. Sadece harf ve alt çizgi kullanabilirsiniz.</span>
            </p>
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

          {/* Store Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Mağaza</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                className="w-full h-14 pl-12 pr-10 bg-white border border-gray-200 rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <span className={selectedStore ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedStore ? selectedStore.store_name : 'Mağaza seç'}
                </span>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className={`w-5 h-5 transition-transform ${showStoreDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Dropdown with Search */}
              {showStoreDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      value={storeSearchQuery}
                      onChange={(e) => setStoreSearchQuery(e.target.value)}
                      placeholder="Mağaza kodu veya ismi ara..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  
                  {/* Store List */}
                  <div className="max-h-52 overflow-y-auto">
                    {filteredStores.length > 0 ? (
                      filteredStores.map((store) => (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => {
                            setSelectedStoreCode(store.store_code);
                            setValue('storeCode', store.store_code);
                            setShowStoreDropdown(false);
                            setStoreSearchQuery('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedStoreCode === store.store_code ? 'bg-mavi-navy/10 text-mavi-navy' : 'text-gray-900'
                          }`}
                        >
                          <p className="font-medium">{store.store_name}</p>
                          <p className="text-xs text-gray-500">Kod: {store.store_code}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        Mağaza bulunamadı
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.storeCode && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.storeCode.message}
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
                placeholder="Şifre oluştur"
                className="w-full h-14 pl-12 pr-12 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Şifreyi tekrar gir"
                className="w-full h-14 pl-12 pr-12 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mavi-navy focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-mavi-navy focus:ring-mavi-navy cursor-pointer"
              />
              <span className="text-sm text-gray-700 flex-1">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-mavi-navy font-semibold hover:underline"
                >
                  Kullanım Şartları ve Sorumluluk Reddi
                </button>
                'ni okudum ve kabul ediyorum.
                <span className="block text-xs text-gray-500 mt-1">
                  (Güncelleme: 06.12.2024)
                </span>
              </span>
            </label>
            {errors.acceptTerms && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.acceptTerms.message}
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

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedStoreCode || !acceptedTerms}
            className="w-full h-14 bg-mavi-navy text-white font-semibold rounded-2xl shadow-lg shadow-mavi-navy/20 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100 mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Kayıt yapılıyor...</span>
              </div>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>
      </section>

      {/* Terms Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      {/* Login Link */}
      <footer className="flex-none py-6 px-6 border-t border-gray-200">
        <p className="text-center text-gray-500">
          Zaten hesabın var mı?{' '}
          <a href="/login" className="text-mavi-navy font-semibold hover:underline">
            Giriş Yap
          </a>
        </p>
      </footer>
    </main>
  );
}
