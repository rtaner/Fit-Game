'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { storeService } from '@/services/store.service';
import { BadgeAvatar } from '@/components/atoms/BadgeAvatar';

interface UserStats {
  totalGames: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
  highScore: number;
  activeBadge?: {
    id: string;
    code: string;
    name: string;
    description: string;
    image_url?: string | null;
    category: string;
  } | null;
}

interface UserRank {
  globalRank: number;
  localRank: number;
}

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier?: string;
  image_url?: string | null;
  isHidden: boolean;
  unlockType: string;
  unlockValue: number;
  userProgress: {
    currentValue: number;
    tierUnlocked?: string;
    unlockedAt?: string;
    isUnlocked: boolean;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [rank, setRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRank, setIsLoadingRank] = useState(true);
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfileData();

    // Reload when page becomes visible (e.g., after navigating back from badges page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProfileData();
      }
    };

    const handleFocus = () => {
      loadProfileData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      // Load rank separately in background (non-blocking)
      loadUserRank();

      // Get game statistics directly from Supabase (bypass API auth issues)
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, total_questions, ended_at')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null);

      const totalGames = sessions?.length || 0;
      const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;

      // Get correct answers
      const { data: answers } = await supabase
        .from('answer_analytics')
        .select('is_correct')
        .eq('user_id', user.id);

      const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const averageScore = totalGames > 0 && sessions
        ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalGames 
        : 0;
      const highScore = totalGames > 0 && sessions
        ? Math.max(...sessions.map(s => s.score || 0)) 
        : 0;

      // Get active badge
      const { data: userData } = await supabase
        .from('users')
        .select('active_badge_id')
        .eq('id', user.id)
        .single();

      let activeBadge = null;
      if (userData?.active_badge_id) {
        const { data: badgeProgress } = await supabase
          .from('user_badge_progress')
          .select('id, badge_code')
          .eq('id', userData.active_badge_id)
          .single();

        if (badgeProgress) {
          const { data: badgeDefinition } = await supabase
            .from('badge_definitions')
            .select('id, code, name, description, image_url, category')
            .eq('code', badgeProgress.badge_code)
            .single();

          if (badgeDefinition) {
            activeBadge = badgeDefinition;
          }
        }
      }

      setStats({
        totalGames,
        totalQuestions,
        correctAnswers,
        accuracy,
        averageScore,
        highScore,
        activeBadge,
      });

      // Get user badges
      const { data: userBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('id, badge_type, badge_name, badge_description, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) {
        console.error('Error fetching badges:', badgesError);
      }

      // Get new badge system badges
      const badgeResponse = await fetch(`/api/badges?userId=${user.id}`);
      if (badgeResponse.ok) {
        const badgeResult = await badgeResponse.json();
        setNewBadges(badgeResult.data.badges || []);
      }

      // Rank is loaded separately in loadUserRank()
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRank = async () => {
    if (!user) return;
    
    setIsLoadingRank(true);
    try {
      const supabase = createClient();
      
      // Use optimized SQL function for rank calculation
      const { data: rankData, error } = await supabase
        .rpc('get_user_rank', { p_user_id: user.id });

      if (error) {
        console.error('Error loading rank:', error);
        // Fallback: show placeholder
        setRank({ globalRank: 0, localRank: 0 });
      } else if (rankData && rankData.length > 0) {
        setRank({
          globalRank: Number(rankData[0].global_rank),
          localRank: Number(rankData[0].local_rank),
        });
      }
    } catch (error) {
      console.error('Error in loadUserRank:', error);
      setRank({ globalRank: 0, localRank: 0 });
    } finally {
      setIsLoadingRank(false);
    }
  };

  // Fetch store name
  useEffect(() => {
    const fetchStoreName = async () => {
      if (user?.store_code) {
        try {
          const store = await storeService.getStoreByCode(user.store_code);
          if (store) {
            setStoreName(store.store_name);
          }
        } catch (error) {
          console.error('Error fetching store:', error);
        }
      }
    };
    fetchStoreName();
  }, [user?.store_code]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
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

  // Format join date
  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-background flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <header className="px-5 pt-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-900 text-center">Profil</h1>
        </header>

        {/* Profile Header Card */}
        <section className="px-5 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100/50"
          >
            <div className="flex items-center gap-4">
              <BadgeAvatar
                badge={stats?.activeBadge}
                fallback={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm text-gray-500">{storeName || `Mağaza ${user?.store_code}`}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Üyelik: {formatJoinDate(user?.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-mavi-navy">{stats?.highScore || 0}</p>
                <p className="text-xs text-gray-500">En Yüksek</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </motion.div>
        </section>

        {/* Daily Streak - Moved to top */}
        <section className="px-5 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Günlük Giriş</h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">Mevcut Seri</p>
                <p className="text-xl font-bold text-[#002D66]">{user?.current_streak || 0} Gün</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">En İyi</p>
                <p className="text-xl font-bold text-gray-900">{user?.longest_streak || 0} Gün</p>
              </div>
            </div>
            <div className="flex justify-between">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => {
                const currentStreak = user?.current_streak || 0;
                // Son 7 günü göster - streak 7'den büyükse tüm günler aktif
                const isActive = currentStreak >= 7 ? true : index < currentStreak;
                
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? 'bg-[#002D66] text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Badges - Moved before stats */}
        <section className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Rozet Vitrinim ({newBadges.filter(b => b.userProgress.isUnlocked).length}/{newBadges.length})
            </h3>
            <button
              onClick={() => router.push('/badges')}
              className="text-sm font-medium text-[#002D66] active:opacity-70 transition-opacity"
            >
              Tümünü Gör
            </button>
          </div>
          {!stats?.activeBadge && newBadges.some(b => b.userProgress.isUnlocked) && (
            <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-lg">✨</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-900">Aktif Rozet Seç!</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Kazandığın rozetlerden birini aktif et ve profilinde göster
                </p>
              </div>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {newBadges
              .sort((a, b) => {
                // Aktif rozet en başta
                const aIsActive = stats?.activeBadge?.code === a.code;
                const bIsActive = stats?.activeBadge?.code === b.code;
                if (aIsActive) return -1;
                if (bIsActive) return 1;
                
                // Sonra unlocked rozetler
                const aUnlocked = a.userProgress.isUnlocked;
                const bUnlocked = b.userProgress.isUnlocked;
                if (aUnlocked && !bUnlocked) return -1;
                if (!aUnlocked && bUnlocked) return 1;
                
                // Unlocked rozetler arasında tarih sıralaması
                if (aUnlocked && bUnlocked) {
                  const aDate = a.userProgress.unlockedAt ? new Date(a.userProgress.unlockedAt).getTime() : 0;
                  const bDate = b.userProgress.unlockedAt ? new Date(b.userProgress.unlockedAt).getTime() : 0;
                  return bDate - aDate;
                }
                return 0;
              })
              .slice(0, 6)
              .map((badge) => {
                const isUnlocked = badge.userProgress.isUnlocked;
                const isHidden = badge.isHidden && !isUnlocked;
                const isActive = stats?.activeBadge?.code === badge.code;
                
                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-2xl p-3 shadow-md border text-center relative ${
                      isActive ? 'border-[#002D66] ring-2 ring-[#002D66]/20' : 
                      isUnlocked ? 'border-gray-100/50' : 'border-gray-200 opacity-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-1 -right-1 bg-[#002D66] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        AKTİF
                      </div>
                    )}
                    <div className="mx-auto mb-2">
                      {isUnlocked ? (
                        <BadgeAvatar
                          badge={badge}
                          size="md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                          🔒
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {isHidden ? '???' : badge.name}
                    </p>
                  </div>
                );
              })}
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="px-5 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">İstatistikler</h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-mavi-navy" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-gray-500">Oyun</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalGames || 0}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-gray-500">Doğru</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.correctAnswers || 0}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-gray-500">Başarı</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">%{stats?.accuracy.toFixed(0) || 0}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100/50">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-mavi-navy" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                <span className="text-xs text-gray-500">Sıralama</span>
              </div>
              {isLoadingRank ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-mavi-navy border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-400">Hesaplanıyor...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  #{rank?.globalRank || '-'}
                  <span className="text-sm font-normal text-gray-500">/{rank?.localRank || '-'}</span>
                </p>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
