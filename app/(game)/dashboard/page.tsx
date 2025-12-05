'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings, Flame, Play, BookOpen, Info, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { RulesModal } from '@/components/molecules/RulesModal';
import { InstallAppCard } from '@/components/molecules/InstallAppCard';
import type { QuizCategory } from '@/types/database.types';

// Kategori isimlerine göre icon mapping
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('denim fit') || name.includes('pantolon')) {
    return '👖'; // Pantolon
  } else if (name.includes('şort') || name.includes('short')) {
    return '🩳'; // Şort
  } else if (name.includes('koleksiyon')) {
    return '🎨'; // Koleksiyon/Palet
  } else if (name.includes('prosedür')) {
    return '📋'; // Prosedür/Pano
  }
  
  // Fallback icons
  const fallbackIcons = ['🎯', '⭐', '📦', '🏆', '💎', '🎪'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIcons[hash % fallbackIcons.length];
};

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
  const [showAIModal, setShowAIModal] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

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

  const checkAICache = (): string | null => {
    if (!user?.id) return null;
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `ai-analysis-${user.id}-${today}`;
    return localStorage.getItem(cacheKey);
  };

  const saveAICache = (insights: string) => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `ai-analysis-${user.id}-${today}`;
    localStorage.setItem(cacheKey, insights);
  };

  const handleAICardClick = () => {
    // Check if there's a cached analysis for today
    const cached = checkAICache();
    if (cached) {
      setAiInsights(cached);
    } else {
      setShowAIModal(true);
    }
  };

  const handleAIAnalysis = async () => {
    if (!user?.id) return;
    
    setIsLoadingAI(true);
    setShowAIModal(false);
    
    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const currentUser = JSON.parse(userStr);

      const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id,
        'X-User-Role': currentUser.role,
        'X-Store-Code': currentUser.store_code.toString(),
      };

      // Fetch training needs data
      const response = await fetch('/api/analytics/training-needs', { headers });
      const result = await response.json();

      if (result.data) {
        const userName = `${currentUser.first_name} ${currentUser.last_name}`;

        // Send to AI
        const aiResponse = await fetch('/api/analytics/ai-insights', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userName,
            categoryNeeds: result.data.categoryNeeds || [],
            confusedFits: result.data.confusedFits || [],
            failedFits: result.data.failedFits || [],
            storeComparison: result.data.storeComparison || [],
          }),
        });

        const aiResult = await aiResponse.json();
        if (aiResult.data) {
          saveAICache(aiResult.data);
          setAiInsights(aiResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      alert('AI analizi yapılırken bir hata oluştu');
    } finally {
      setIsLoadingAI(false);
    }
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
                const icon = getCategoryIcon(category.name);
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

            {/* Hata Analizi Kartı */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (categories.length + 2) * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAICardClick}
              className="bg-purple-50 border border-border-light rounded-3xl p-4 cursor-pointer shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-all hover:shadow-md"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-purple-600 text-xs font-bold text-center">
                Hata Analizi
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

      {/* AI Analysis Confirmation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI Hata Analizi</h2>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Yapay zeka, senin performansını analiz edecek ve hata yaptığın konularda kişiselleştirilmiş öneriler sunacak.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
              <p className="text-xs text-purple-800">
                ⏱️ Bu analiz 20-30 saniye sürebilir
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 font-semibold transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAIAnalysis}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-colors shadow-lg shadow-purple-600/20"
              >
                Başla
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Loading Modal */}
      {isLoadingAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Analiz Ediliyor...</h2>
              <p className="text-gray-600 text-sm text-center">
                Yapay zeka performansını inceliyor
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Results Modal */}
      {aiInsights && !isLoadingAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Analiz Sonuçları</h2>
              </div>
              <button
                onClick={() => setAiInsights(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: aiInsights
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '</p><p class="mt-3">')
                      .replace(/^(.+)$/gm, '<p>$1</p>')
                      .replace(/^- /gm, '• '),
                  }}
                />
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setAiInsights(null)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-colors shadow-lg shadow-purple-600/20"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
