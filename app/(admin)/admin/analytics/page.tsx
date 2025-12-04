'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';

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

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionItem[]>([]);
  const [tagPerformance, setTagPerformance] = useState<TagPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);

      const [summaryRes, confusionRes, tagRes] = await Promise.all([
        fetch(`/api/analytics/summary?${params}`),
        fetch(`/api/analytics/confusion-matrix?${params}`),
        fetch(`/api/analytics/tag-performance?${params}`),
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
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);

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
      <AdminGuard>
        <AdminSidebar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <p>Yükleniyor...</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analitik Dashboard</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📥 JSON Export
          </button>
        </div>

        {/* Date Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Filtrele
            </button>
            <button
              onClick={() => {
                setDateFilter({ startDate: '', endDate: '' });
                setTimeout(loadAnalytics, 100);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Toplam Cevap</p>
              <p className="text-3xl font-bold text-blue-600">{summary.totalAnswers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Doğruluk Oranı</p>
              <p className="text-3xl font-bold text-green-600">{summary.accuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Ort. Süre</p>
              <p className="text-3xl font-bold text-purple-600">
                {(summary.averageResponseTime / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Joker Kullanımı</p>
              <p className="text-3xl font-bold text-orange-600">
                {summary.lifeline50Used + summary.lifelineSkipUsed}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Confusion Matrix */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">En Çok Karıştırılan Sorular</h2>
            {confusionMatrix.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {confusionMatrix.map((item, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm">{item.questionName}</p>
                      <span className="text-sm text-gray-600">{item.count}x</span>
                    </div>
                    <p className="text-sm text-red-600">→ {item.selectedAnswerName}</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Tag Bazlı Performans</h2>
            {tagPerformance.length === 0 ? (
              <p className="text-gray-600">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {tagPerformance.map((tag, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{tag.tag}</span>
                      <span className="text-sm text-gray-600">
                        {tag.correct}/{tag.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          tag.accuracy >= 80
                            ? 'bg-green-500'
                            : tag.accuracy >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${tag.accuracy}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tag.accuracy.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
