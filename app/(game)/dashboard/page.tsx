'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings, Flame, Play, BookOpen, Info } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { RulesModal } from '@/components/molecules/RulesModal';
import { InstallAppCard } from '@/components/molecules/InstallAppCard';
import type { QuizCategory } from '@/types/database.types';

const categoryIcons = ['🎯', '👖', '📦', '⭐', '🎨', '🏆'];

// Kategori renkleri - referans tasarımdaki gibi (border: #dbdee1)
const categoryColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
  { bg: 'bg-pink-50', text: 'text-pink-600', icon: 'bg-pink-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    
    if (user?.id) {
      const lastStreakUpdate = localStorage.getItem('last-streak-update');
      const today = new Date().toDateString();
      
      if (lastStreakUpdate !== today) {
        useAuthStore.getState().updateStreak(user.id);
        localStorage.setItem('last-streak-update', today);
      }
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = (categoryId: string) => {
    router.push(`/play/${categoryId}`);
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <header className="flex-none px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-sm text-gray-500">Hoş geldin,</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.first_name || 'Kullanıcı'}
            </h1>
          </motion.div>
          <div className="flex gap-3">
            {(user?.role === 'admin' || user?.role === 'store_manager') && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Both admin and store_manager go to admin dashboard menu
                  router.push('/admin');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-700" />
                <span className="text-sm text-gray-700 font-medium">Analizler</span>
              </motion.button>
            )}
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#002D66] flex items-center justify-center shadow-lg shadow-[#002D66]/20">
                  <span className="text-white font-semibold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-medium">Profil</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      useAuthStore.getState().logout();
                      router.push('/login');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 text-left"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Daily Streak Card */}
      <section className="flex-none px-6 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#002D66] to-[#0E487A] rounded-3xl p-5 shadow-xl shadow-blue-600/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm font-medium mb-1">Günlük Seri</p>
              <p className="text-white text-4xl font-bold leading-none">{user?.current_streak || 0} Gün</p>
            </div>
          </div>
          <p className="text-white/80 text-sm mt-4">Harika gidiyorsun! Seriyi devam ettir.</p>
        </motion.div>
      </section>

      {/* Tüm Kategoriler Oyunu Kartı */}
      <section className="flex-none px-6 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            // Tüm kategorileri içeren özel bir oyun başlat
            const allCategoriesId = categories.find(c => c.is_all_categories)?.id;
            if (allCategoriesId) {
              handleStartGame(allCategoriesId);
            } else if (categories.length > 0) {
              // Eğer "Tüm Kategoriler" yoksa, ilk kategoriyi başlat
              handleStartGame(categories[0].id);
            }
          }}
          className="bg-[#002D66] rounded-3xl p-5 shadow-xl shadow-blue-600/20 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white text-xl font-bold mb-2">Oynamaya Başla</h3>
              <p className="text-white/80 text-sm">Tüm kategorilerden soruları cevapla!</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Play className="h-7 w-7 text-white fill-white" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="flex-1 px-6 pb-4 overflow-y-auto">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Kategoriler</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz kategori eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categories
              .filter(cat => !cat.is_all_categories) // "Tüm Kategoriler"i filtrele
              .map((category, index) => {
                const icon = categoryIcons[index % categoryIcons.length];
                const colors = categoryColors[index % categoryColors.length];

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartGame(category.id)}
                    className={`${colors.bg} border border-border-light rounded-3xl p-4 cursor-pointer shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-all hover:shadow-md`}
                  >
                    {/* Icon */}
                    <div className={`${colors.icon} w-12 h-12 rounded-2xl flex items-center justify-center mb-3`}>
                      <span className="text-3xl">{icon}</span>
                    </div>
                    
                    {/* Category Name */}
                    <span className={`${colors.text} text-xs font-bold text-center line-clamp-2`}>
                      {category.name}
                    </span>
                  </motion.div>
                );
              })}

            {/* Eğitim Kartı */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: categories.length * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/training')}
              className="bg-emerald-50 border border-border-light rounded-3xl p-4 cursor-pointer shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-all hover:shadow-md"
            >
              <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-emerald-600 text-xs font-bold text-center">
                Eğitim
              </span>
            </motion.div>

            {/* Kurallar Kartı */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (categories.length + 1) * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRulesModalOpen(true)}
              className="bg-orange-50 border border-border-light rounded-3xl p-4 cursor-pointer shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-all hover:shadow-md"
            >
              <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                <Info className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-orange-600 text-xs font-bold text-center">
                Kurallar
              </span>
            </motion.div>

            {/* Uygulamayı Yükle Kartı */}
            <InstallAppCard />
          </div>
        )}
        
        {/* Credit Text */}
        {!isLoading && categories.length > 0 && (
          <div className="mt-6 pb-2">
            <p className="text-center text-gray-400 text-xs">
              Hazırlayan: Bilecik Bozüyük Mağazası - Başarılar
            </p>
          </div>
        )}
      </section>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </main>
  );
}
