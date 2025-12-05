'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AnalyticsGuard } from '@/components/organisms/AnalyticsGuard';
import { AlertTriangle, TrendingDown, Users, Target } from 'lucide-react';

interface CategoryNeed {
  category: string;
  accuracy: number;
  total: number;
  correct: number;
  wrong: number;
  trainingPriority: 'high' | 'medium' | 'low';
}

interface ConfusedFit {
  correctFit: string;
  confusedWithFit: string;
  count: number;
  percentage: number;
}

interface FailedFit {
  fitName: string;
  totalAsked: number;
  totalWrong: number;
  errorRate: number;
}

interface StoreComparison {
  storeCode: number;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

export default function TrainingNeedsPage() {
  const [categoryNeeds, setCategoryNeeds] = useState<CategoryNeed[]>([]);
  const [confusedFits, setConfusedFits] = useState<ConfusedFit[]>([]);
  const [failedFits, setFailedFits] = useState<FailedFit[]>([]);
  const [storeComparison, setStoreComparison] = useState<StoreComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month'>('all');
  const [users, setUsers] = useState<Array<{ id: string; username: string; first_name: string; last_name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  // Calculate date range based on time period
  const getDateRange = () => {
    if (timePeriod === 'all') {
      return { startDate: '', endDate: '' };
    }
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timePeriod === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timePeriod === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    loadUsers();
    loadTrainingNeeds();
  }, []);

  const loadUsers = async () => {
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

      const response = await fetch('/api/analytics/users', { headers });
      const result = await response.json();

      if (result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTrainingNeeds = async () => {
    setIsLoading(true);
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('current-user');
      if (!userStr) {
        console.error('No user found in localStorage');
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(userStr);

      const dateRange = getDateRange();
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedUserId && selectedUserId !== 'all') params.append('userId', selectedUserId);

      const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id,
        'X-User-Role': currentUser.role,
        'X-Store-Code': currentUser.store_code.toString(),
      };

      const response = await fetch(`/api/analytics/training-needs?${params}`, { headers });
      const result = await response.json();

      if (result.data) {
        setCategoryNeeds(result.data.categoryNeeds || []);
        setConfusedFits(result.data.confusedFits || []);
        setFailedFits(result.data.failedFits || []);
        setStoreComparison(result.data.storeComparison || []);
      }
    } catch (error) {
      console.error('Error loading training needs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Yüksek Öncelik';
      case 'medium':
        return 'Orta Öncelik';
      case 'low':
        return 'Düşük Öncelik';
      default:
        return 'Bilinmiyor';
    }
  };

  if (isLoading) {
    return (
      <AnalyticsGuard>
        <AdminSidebar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <p>Yükleniyor...</p>
        </div>
      </AnalyticsGuard>
    );
  }

  return (
    <AnalyticsGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Eğitim İhtiyacı Analizi</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Çalışanların zayıf noktalarını ve eğitim ihtiyaçlarını görüntüleyin
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Personel</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Tüm Personel</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zaman Aralığı</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'all' | 'week' | 'month')}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Tüm Zamanlar</option>
                  <option value="week">Son 1 Hafta</option>
                  <option value="month">Son 1 Ay</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={loadTrainingNeeds}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Filtrele
              </button>
              <button
                onClick={() => {
                  setTimePeriod('all');
                  setSelectedUserId('all');
                  setTimeout(loadTrainingNeeds, 100);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Category Training Needs */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <h2 className="text-lg md:text-xl font-bold">Kategori Bazlı Eğitim İhtiyacı</h2>
            </div>
            {categoryNeeds.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {categoryNeeds.slice(0, 10).map((category, index) => (
                  <div key={index} className="border rounded-lg p-2 md:p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">{category.category}</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {category.correct}/{category.total} doğru ({category.accuracy.toFixed(1)}
                          %)
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${getPriorityColor(
                          category.trainingPriority
                        )}`}
                      >
                        {getPriorityText(category.trainingPriority)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          category.accuracy >= 80
                            ? 'bg-green-500'
                            : category.accuracy >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${category.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Failed Fits */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              <h2 className="text-lg md:text-xl font-bold">En Çok Yanlış Yapılan Fitler</h2>
            </div>
            {failedFits.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {failedFits.map((fit, index) => (
                  <div key={index} className="border rounded-lg p-2 md:p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-sm md:text-base truncate flex-1 mr-2">{fit.fitName}</p>
                      <span className="text-xs md:text-sm text-red-600 font-semibold whitespace-nowrap">
                        %{fit.errorRate.toFixed(1)} hata
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">
                      {fit.totalWrong}/{fit.totalAsked} yanlış
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${fit.errorRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Confused Fit Pairs */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              <h2 className="text-lg md:text-xl font-bold">En Çok Karıştırılan Fit Çiftleri</h2>
            </div>
            {confusedFits.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {confusedFits.map((pair, index) => (
                  <div key={index} className="border rounded-lg p-2 md:p-3 bg-orange-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-gray-600">Doğru cevap:</p>
                        <p className="font-semibold text-sm md:text-base text-green-700 truncate">{pair.correctFit}</p>
                      </div>
                      <div className="hidden sm:block px-2">
                        <span className="text-xl md:text-2xl text-gray-400">→</span>
                      </div>
                      <div className="sm:hidden">
                        <span className="text-lg text-gray-400">↓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-gray-600">Verilen cevap:</p>
                        <p className="font-semibold text-sm md:text-base text-red-700 truncate">{pair.confusedWithFit}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-gray-600">{pair.count} kez karıştırıldı</span>
                      <span className="text-xs md:text-sm font-semibold text-orange-600">
                        %{pair.percentage.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store Comparison */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              <h2 className="text-lg md:text-xl font-bold">Mağaza Bazlı Karşılaştırma</h2>
            </div>
            {storeComparison.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {storeComparison.slice(0, 10).map((store, index) => (
                  <div key={index} className="border rounded-lg p-2 md:p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-sm md:text-base">Mağaza {store.storeCode}</p>
                      <span
                        className={`text-xs md:text-sm font-semibold ${
                          store.accuracy >= 80
                            ? 'text-green-600'
                            : store.accuracy >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        %{store.accuracy.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">
                      {store.correctAnswers}/{store.totalAnswers} doğru
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          store.accuracy >= 80
                            ? 'bg-green-500'
                            : store.accuracy >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${store.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900 text-sm md:text-base">💡 Nasıl Kullanılır:</h3>
          <ul className="text-xs md:text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Yüksek Öncelik (Kırmızı):</strong> %60'ın altında başarı - Acil eğitim
              gerekli
            </li>
            <li>
              • <strong>Orta Öncelik (Sarı):</strong> %60-80 arası başarı - Pekiştirme eğitimi
              önerilir
            </li>
            <li>
              • <strong>Düşük Öncelik (Yeşil):</strong> %80'in üstünde başarı - İyi durumda
            </li>
            <li>
              • <strong>Karıştırılan Fit Çiftleri:</strong> Hangi fitlerin birbirine karıştırıldığını
              gösterir
            </li>
          </ul>
        </div>
      </div>
    </AnalyticsGuard>
  );
}
