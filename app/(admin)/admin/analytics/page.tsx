'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AnalyticsGuard } from '@/components/organisms/AnalyticsGuard';

interface AnalyticsSummary {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  lifeline50Used: number;
  lifelineSkipUsed: number;
}

interface ConfusionItem {
  questionName: string;
  selectedAnswerName: string;
  count: number;
  percentage: number;
}

interface TagPerformance {
  tag: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionItem[]>([]);
  const [tagPerformance, setTagPerformance] = useState<TagPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month'>('all');
  const [users, setUsers] = useState<User[]>([]);
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
    loadAnalytics();
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

  const loadAnalytics = async () => {
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

      const [summaryRes, confusionRes, tagRes] = await Promise.all([
        fetch(`/api/analytics/summary?${params}`, { headers }),
        fetch(`/api/analytics/confusion-matrix?${params}`, { headers }),
        fetch(`/api/analytics/tag-performance?${params}`, { headers }),
      ]);

      const summaryData = await summaryRes.json();
      const confusionData = await confusionRes.json();
      const tagData = await tagRes.json();

      if (summaryData.data) setSummary(summaryData.data);
      if (confusionData.data) setConfusionMatrix(confusionData.data.slice(0, 10));
      if (tagData.data) setTagPerformance(tagData.data.slice(0, 10));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const dateRange = getDateRange();
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Analitik Dashboard</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium w-full sm:w-auto"
          >
            📥 JSON Export
          </button>
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
                onClick={loadAnalytics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Filtrele
              </button>
              <button
                onClick={() => {
                  setTimePeriod('all');
                  setSelectedUserId('all');
                  setTimeout(loadAnalytics, 100);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <p className="text-gray-600 text-xs md:text-sm">Toplam Cevap</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{summary.totalAnswers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <p className="text-gray-600 text-xs md:text-sm">Doğruluk Oranı</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{summary.accuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <p className="text-gray-600 text-xs md:text-sm">Ort. Süre</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                {(summary.averageResponseTime / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <p className="text-gray-600 text-xs md:text-sm">Joker Kullanımı</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">
                {summary.lifeline50Used + summary.lifelineSkipUsed}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Confusion Matrix */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">En Çok Karıştırılan Sorular</h2>
            {confusionMatrix.length === 0 ? (
              <p className="text-gray-600 text-sm">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {confusionMatrix.map((item, index) => (
                  <div key={index} className="border-b pb-2 md:pb-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-xs md:text-sm flex-1 mr-2 line-clamp-2">{item.questionName}</p>
                      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{item.count}x</span>
                    </div>
                    <p className="text-xs md:text-sm text-red-600 truncate">→ {item.selectedAnswerName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag Performance */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Tag Bazlı Performans</h2>
            {tagPerformance.length === 0 ? (
              <p className="text-gray-600 text-sm">Veri yok</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {tagPerformance.map((tag, index) => (
                  <div key={index} className="border-b pb-2 md:pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm md:text-base truncate flex-1 mr-2">{tag.tag}</span>
                      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                        {tag.correct}/{tag.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div
                        className={`h-2 md:h-3 rounded-full ${
                          tag.accuracy >= 80
                            ? 'bg-green-500'
                            : tag.accuracy >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${tag.accuracy}%` }}
                      />
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">{tag.accuracy.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnalyticsGuard>
  );
}
