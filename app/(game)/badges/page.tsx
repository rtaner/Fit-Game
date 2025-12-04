'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier?: string;
  emoji: string;
  isHidden: boolean;
  unlockType: string;
  unlockValue: number;
  userProgress: {
    id?: string;
    currentValue: number;
    tierUnlocked?: string;
    unlockedAt?: string;
    isUnlocked: boolean;
    isActive?: boolean;
  };
}

export default function BadgesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesByCategory, setBadgesByCategory] = useState<Record<string, Badge[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('education');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);
  const [settingActive, setSettingActive] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBadges();
  }, [user]);

  const loadBadges = async () => {
    if (!user) return;

    try {
      console.log('Fetching badges for user:', user.id);
      const response = await fetch(`/api/badges?userId=${user.id}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Result:', result);
        console.log('Badges count:', result.data?.badges?.length);
        console.log('Categories:', Object.keys(result.data?.badgesByCategory || {}));
        
        setBadges(result.data.badges || []);
        setBadgesByCategory(result.data.badgesByCategory || {});
        setActiveBadgeId(result.data.activeBadgeId || null);
        
        // Set first available category as selected
        const categories = Object.keys(result.data.badgesByCategory || {});
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
          console.log('Selected category:', categories[0]);
        } else {
          console.log('No categories found!');
        }
      } else {
        console.error('Response not OK:', response.status);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveBadge = async (badgeProgressId: string) => {
    if (!user) return;

    setSettingActive(badgeProgressId);
    try {
      const supabase = createClient();
      
      // Verify badge is unlocked
      const { data: badgeProgress } = await supabase
        .from('user_badge_progress')
        .select('id, tier_unlocked, unlocked_at')
        .eq('id', badgeProgressId)
        .eq('user_id', user.id)
        .single();

      if (!badgeProgress || !badgeProgress.tier_unlocked || !badgeProgress.unlocked_at) {
        showToast('Bu rozet henüz kazanılmamış', 'error');
        return;
      }

      // Update active badge directly with client
      const { error: updateError } = await supabase
        .from('users')
        .update({ active_badge_id: badgeProgressId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error setting active badge:', updateError);
        showToast('Aktif rozet ayarlanamadı', 'error');
        return;
      }

      setActiveBadgeId(badgeProgressId);
      showToast('Rozet aktif olarak ayarlandı! 🎉', 'success');
      await loadBadges();
    } catch (error) {
      console.error('Error setting active badge:', error);
      showToast('Bir hata oluştu', 'error');
    } finally {
      setSettingActive(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mavi-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.userProgress.isUnlocked).length;
  const totalCount = badges.length;
  
  const categoryNames: Record<string, string> = {
    education: '📚 Eğitim',
    performance: '⚡ Performans',
    consistency: '🔥 İstikrar',
    competition: '🏅 Rekabet',
    secret: '🎭 Gizli',
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-background flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <header className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Tüm Rozetler</h1>
              <p className="text-sm text-gray-500">
                {earnedCount} / {totalCount} rozet kazanıldı
              </p>
            </div>
          </div>
        </header>

        {/* Progress Overview */}
        <section className="px-5 pb-4">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">Toplam İlerleme</span>
              <span className="text-sm font-semibold text-mavi-navy">
                %{totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-mavi-navy to-mavi-light rounded-full"
              />
            </div>
          </div>
        </section>

        {/* Badge Categories */}
        {Object.keys(badgesByCategory).map((category) => {
          const categoryBadges = (badgesByCategory[category] || []).sort((a, b) => {
            const aUnlocked = a.userProgress.isUnlocked;
            const bUnlocked = b.userProgress.isUnlocked;
            if (aUnlocked && !bUnlocked) return -1;
            if (!aUnlocked && bUnlocked) return 1;
            if (aUnlocked && bUnlocked) {
              const aDate = a.userProgress.unlockedAt ? new Date(a.userProgress.unlockedAt).getTime() : 0;
              const bDate = b.userProgress.unlockedAt ? new Date(b.userProgress.unlockedAt).getTime() : 0;
              return bDate - aDate;
            }
            return 0;
          });
          const earnedInCategory = categoryBadges.filter((b) => b.userProgress.isUnlocked).length;

          return (
            <section key={category} className="px-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{categoryNames[category]?.split(' ')[0] || '📦'}</span>
                <h2 className="text-sm font-semibold text-gray-900">
                  {categoryNames[category]?.split(' ').slice(1).join(' ') || category}
                </h2>
                <span className="text-xs text-gray-500 ml-auto">
                  {earnedInCategory}/{categoryBadges.length}
                </span>
              </div>

              <div className="space-y-3">
                {categoryBadges.map((badge) => {
                  const isUnlocked = badge.userProgress.isUnlocked;
                  const isHidden = badge.isHidden && !isUnlocked;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`w-full bg-white rounded-2xl p-4 shadow-md border text-left ${
                        isUnlocked ? 'border-gray-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Badge Icon */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                            isUnlocked
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-400/30'
                              : 'bg-gray-100'
                          }`}
                        >
                          {isUnlocked ? badge.emoji : '🔒'}
                        </div>

                        {/* Badge Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold truncate ${
                                isUnlocked ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {isHidden ? '???' : badge.name}
                            </h3>
                            {isUnlocked && (
                              <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          {/* Description - only show for unlocked badges or non-hidden badges */}
                          {(isUnlocked || !isHidden) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {badge.description}
                            </p>
                          )}
                          
                          {/* Hidden badge message */}
                          {isHidden && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">
                              Bu rozeti kazanarak açıklamasını gör
                            </p>
                          )}

                          {/* Progress Bar (if applicable) */}
                          {!isUnlocked && !isHidden && badge.userProgress.currentValue > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">İlerleme</span>
                                <span className="text-xs font-medium text-gray-900">
                                  {badge.userProgress.currentValue}/{badge.unlockValue}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-mavi-navy/60 rounded-full"
                                  style={{ width: `${Math.min((badge.userProgress.currentValue / badge.unlockValue) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Active Badge Button */}
                          {isUnlocked && badge.userProgress.unlockedAt && (
                            <div className="mt-2">
                              {badge.userProgress.isActive ? (
                                <div className="text-xs text-blue-600 font-bold bg-blue-50 py-1.5 px-3 rounded-full inline-block">
                                  ⭐ Aktif
                                </div>
                              ) : (
                                <button
                                  onClick={() => badge.userProgress.id && setActiveBadge(badge.userProgress.id)}
                                  disabled={settingActive === badge.userProgress.id}
                                  className="text-xs text-white font-semibold bg-mavi-navy hover:bg-mavi-navy/90 py-1.5 px-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {settingActive === badge.userProgress.id ? 'Ayarlanıyor...' : 'Aktif Yap'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Chevron */}
                        <svg
                          className="w-5 h-5 text-gray-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {/* Bottom Padding */}
        <div className="h-8" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </main>
  );
}
