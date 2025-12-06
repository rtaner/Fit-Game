'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { useAuthStore } from '@/stores/useAuthStore';
import { BadgeAvatar } from '@/components/atoms/BadgeAvatar';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  storeCode: number;
  storeName: string;
  score: number; // Total score
  highScore: number; // Highest single game score
  totalGames: number;
  activeBadge?: {
    id: string;
    code: string;
    name: string;
    image_url?: string | null;
  } | null;
}

interface StoreLeaderboardEntry {
  rank: number;
  storeCode: number;
  storeName: string;
  averageScore: number;
  totalGames: number;
  totalPlayers: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'individual' | 'store' | 'myStore'>('individual');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [individualData, setIndividualData] = useState<LeaderboardEntry[]>([]);
  const [storeData, setStoreData] = useState<StoreLeaderboardEntry[]>([]);
  const [myStoreData, setMyStoreData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, [timeFilter]); // Reload when time filter changes

  const loadLeaderboards = async () => {
    setIsLoading(true);
    try {
      // Try to fetch, but handle errors gracefully
      try {
        const [individualRes, storeRes, myStoreRes] = await Promise.all([
          fetch(`/api/leaderboard/individual?timeFilter=${timeFilter}`),
          fetch('/api/leaderboard/store'),
          user?.store_code ? fetch(`/api/leaderboard/my-store?storeCode=${user.store_code}`) : Promise.resolve(null),
        ]);

        if (individualRes.ok) {
          const individualResult = await individualRes.json();
          if (individualResult.data) setIndividualData(individualResult.data);
        }

        if (storeRes.ok) {
          const storeResult = await storeRes.json();
          if (storeResult.data) setStoreData(storeResult.data);
        }

        if (myStoreRes && myStoreRes.ok) {
          const myStoreResult = await myStoreRes.json();
          if (myStoreResult.data) setMyStoreData(myStoreResult.data);
        }
      } catch (fetchError) {
        console.log('Leaderboard API not available yet, showing empty state');
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
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

  // Get current data based on active tab
  const currentData = activeTab === 'individual' ? individualData : 
                      activeTab === 'myStore' ? myStoreData : 
                      storeData;
  
  const topThree = currentData.slice(0, 3);
  const restOfList = currentData.slice(3);

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <header className="px-5 pt-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-900 text-center">Skor Tablosu</h1>
        </header>

        {/* Time Period Tabs */}
        <section className="px-5 pb-3">
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            <button
              onClick={() => setTimeFilter('week')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                timeFilter === 'week' ? 'bg-white text-mavi-navy shadow-md' : 'text-gray-500'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                timeFilter === 'month' ? 'bg-white text-mavi-navy shadow-md' : 'text-gray-500'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                timeFilter === 'all' ? 'bg-white text-mavi-navy shadow-md' : 'text-gray-500'
              }`}
            >
              Tüm Zamanlar
            </button>
          </div>
        </section>

        {/* Ranking Type Tabs */}
        <section className="px-5 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                activeTab === 'store'
                  ? 'bg-mavi-navy text-white border-mavi-navy shadow-lg shadow-mavi-navy/20'
                  : 'bg-white text-gray-900 border-gray-100/50'
              }`}
            >
              Mağazalar
            </button>
            <button
              onClick={() => setActiveTab('myStore')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                activeTab === 'myStore'
                  ? 'bg-mavi-navy text-white border-mavi-navy shadow-lg shadow-mavi-navy/20'
                  : 'bg-white text-gray-900 border-gray-100/50'
              }`}
            >
              Mağazam
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                activeTab === 'individual'
                  ? 'bg-mavi-navy text-white border-mavi-navy shadow-lg shadow-mavi-navy/20'
                  : 'bg-white text-gray-900 border-gray-100/50'
              }`}
            >
              Bireysel
            </button>
          </div>
        </section>

        {/* Podium Section */}
        <section className="px-5 pb-4 pt-4">
          {topThree.length > 0 && (
            <div className="flex items-end justify-center gap-3">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  {activeTab === 'store' && 'storeName' in topThree[1] ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg mb-2">
                      <span className="text-white font-bold text-2xl">
                        {topThree[1].storeName.substring(5, 7)}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <BadgeAvatar
                        badge={'activeBadge' in topThree[1] ? topThree[1].activeBadge : undefined}
                        fallback={'username' in topThree[1] ? topThree[1].username.substring(0, 2).toUpperCase() : '??'}
                        size="lg"
                        className="shadow-lg"
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium text-gray-900 text-center truncate w-20">
                    {activeTab === 'store' && 'storeName' in topThree[1]
                      ? topThree[1].storeName.replace('Mavi ', '')
                      : 'username' in topThree[1]
                      ? topThree[1].username.split(' ')[0]
                      : '??'
                    }
                  </p>
                  <p className="text-xs text-mavi-navy font-semibold">
                    {activeTab === 'store' && 'averageScore' in topThree[1]
                      ? topThree[1].averageScore.toFixed(1)
                      : 'score' in topThree[1]
                      ? topThree[1].score
                      : 0
                    }
                  </p>
                  {'highScore' in topThree[1] && topThree[1].highScore && (
                    <p className="text-[9px] text-gray-400">
                      En yüksek puan: {topThree[1].highScore}
                    </p>
                  )}
                  <div className="h-14 w-20 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-lg">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="flex flex-col items-center -mt-4">
                  <div className="relative">
                    {activeTab === 'store' && 'storeName' in topThree[0] ? (
                      <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-xl mb-2 ring-4 ring-amber-200" style={{width: '72px', height: '72px'}}>
                        <span className="text-white font-bold text-3xl">
                          {topThree[0].storeName.substring(5, 7)}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-2 ring-4 ring-amber-200 rounded-full">
                        <BadgeAvatar
                          badge={'activeBadge' in topThree[0] ? topThree[0].activeBadge : undefined}
                          fallback={'username' in topThree[0] ? topThree[0].username.substring(0, 2).toUpperCase() : '??'}
                          size="xl"
                          className="shadow-xl"
                        />
                      </div>
                    )}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-900 text-center truncate w-24">
                    {activeTab === 'store' && 'storeName' in topThree[0]
                      ? topThree[0].storeName.replace('Mavi ', '')
                      : 'username' in topThree[0]
                      ? topThree[0].username.split(' ')[0]
                      : '??'
                    }
                  </p>
                  <p className="text-xs text-mavi-navy font-semibold">
                    {activeTab === 'store' && 'averageScore' in topThree[0]
                      ? topThree[0].averageScore.toFixed(1)
                      : 'score' in topThree[0]
                      ? topThree[0].score
                      : 0
                    }
                  </p>
                  {'highScore' in topThree[0] && topThree[0].highScore && (
                    <p className="text-[9px] text-gray-400">
                      En yüksek puan: {topThree[0].highScore}
                    </p>
                  )}
                  <div className="h-20 w-24 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-amber-800 font-bold text-xl">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  {activeTab === 'store' && 'storeName' in topThree[2] ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg mb-2">
                      <span className="text-white font-bold text-2xl">
                        {topThree[2].storeName.substring(5, 7)}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <BadgeAvatar
                        badge={'activeBadge' in topThree[2] ? topThree[2].activeBadge : undefined}
                        fallback={'username' in topThree[2] ? topThree[2].username.substring(0, 2).toUpperCase() : '??'}
                        size="lg"
                        className="shadow-lg"
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium text-gray-900 text-center truncate w-20">
                    {activeTab === 'store' && 'storeName' in topThree[2]
                      ? topThree[2].storeName.replace('Mavi ', '')
                      : 'username' in topThree[2]
                      ? topThree[2].username.split(' ')[0]
                      : '??'
                    }
                  </p>
                  <p className="text-xs text-mavi-navy font-semibold">
                    {activeTab === 'store' && 'averageScore' in topThree[2]
                      ? topThree[2].averageScore.toFixed(1)
                      : 'score' in topThree[2]
                      ? topThree[2].score
                      : 0
                    }
                  </p>
                  {'highScore' in topThree[2] && topThree[2].highScore && (
                    <p className="text-[9px] text-gray-400">
                      En yüksek puan: {topThree[2].highScore}
                    </p>
                  )}
                  <div className="h-10 w-20 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-orange-800 font-bold text-lg">3</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Rankings List */}
        <section className="px-5 pb-4">
          {activeTab === 'individual' && (

            <div className="space-y-2">
              {restOfList.length === 0 && topThree.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Henüz veri yok</p>
              ) : (
                restOfList.map((entry, index) => {
                  const rank = index + 4;
                  const isHighlighted = 'userId' in entry ? entry.userId === user?.id : false;
                  
                  return (
                    <div
                      key={'userId' in entry ? entry.userId : entry.storeCode}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isHighlighted ? 'bg-mavi-navy/5 border-mavi-navy/20 shadow-md' : 'bg-white border-gray-100/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isHighlighted ? 'bg-mavi-navy text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {rank}
                      </div>

                      {'username' in entry && 'activeBadge' in entry ? (
                        <BadgeAvatar
                          badge={entry.activeBadge}
                          fallback={entry.username.substring(0, 2).toUpperCase()}
                          size="sm"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-semibold ${
                          isHighlighted ? 'bg-mavi-navy text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          {entry.storeName.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {'username' in entry ? entry.username : entry.storeName}
                          {isHighlighted && ' (Sen)'}
                        </p>
                        <p className="text-xs text-gray-500">{entry.storeName}</p>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-bold ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {'score' in entry ? entry.score : entry.averageScore}
                        </p>
                        {'score' in entry && entry.highScore ? (
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                            En yüksek puan: {entry.highScore}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {'score' in entry ? 'puan' : 'ort. puan'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'myStore' && (
            <div className="space-y-2">
              {myStoreData.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Mağazanda henüz başka oyuncu yok</p>
              ) : (
                myStoreData.map((entry) => {
                  const isHighlighted = entry.userId === user?.id;
                  
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isHighlighted ? 'bg-mavi-navy/5 border-mavi-navy/20 shadow-md' : 'bg-white border-gray-100/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isHighlighted ? 'bg-mavi-navy text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {entry.rank}
                      </div>

                      <BadgeAvatar
                        badge={entry.activeBadge}
                        fallback={entry.username.substring(0, 2).toUpperCase()}
                        size="sm"
                      />

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {entry.username}
                          {isHighlighted && ' (Sen)'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-bold ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {entry.score}
                        </p>
                        {entry.highScore && (
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                            En yüksek puan: {entry.highScore}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-2">
              {storeData.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Henüz veri yok</p>
              ) : (
                storeData.map((entry) => {
                  const isHighlighted = entry.storeCode === user?.store_code;
                  
                  return (
                    <div
                      key={entry.storeCode}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isHighlighted ? 'bg-mavi-navy/5 border-mavi-navy/20 shadow-md' : 'bg-white border-gray-100/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isHighlighted ? 'bg-mavi-navy text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {entry.rank}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {entry.storeName}
                          {isHighlighted && ' (Sen)'}
                        </p>
                        <p className="text-xs text-gray-500">{entry.totalPlayers} üye</p>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-bold ${isHighlighted ? 'text-mavi-navy' : 'text-gray-900'}`}>
                          {entry.averageScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">ortalama puan</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
