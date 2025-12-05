'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AnalyticsGuard } from '@/components/organisms/AnalyticsGuard';
import { Sparkles, Loader2, Trash2, Calendar } from 'lucide-react';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface SavedAnalysis {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  date: string;
}

export default function AIInsightsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
    loadSavedAnalyses();
    cleanOldAnalyses();
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

  const loadSavedAnalyses = () => {
    const saved = localStorage.getItem('ai-analyses');
    if (saved) {
      const analyses: SavedAnalysis[] = JSON.parse(saved);
      // Sort by timestamp descending (newest first)
      analyses.sort((a, b) => b.timestamp - a.timestamp);
      setSavedAnalyses(analyses);
    }
  };

  const cleanOldAnalyses = () => {
    const saved = localStorage.getItem('ai-analyses');
    if (!saved) return;

    const analyses: SavedAnalysis[] = JSON.parse(saved);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Keep only analyses from last 7 days
    const filtered = analyses.filter((a) => a.timestamp > sevenDaysAgo);
    
    if (filtered.length !== analyses.length) {
      localStorage.setItem('ai-analyses', JSON.stringify(filtered));
      setSavedAnalyses(filtered);
    }
  };

  const saveAnalysis = (userId: string, userName: string, content: string) => {
    const analysis: SavedAnalysis = {
      id: `${userId}-${Date.now()}`,
      userId,
      userName,
      content,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('tr-TR'),
    };

    const saved = localStorage.getItem('ai-analyses');
    const analyses: SavedAnalysis[] = saved ? JSON.parse(saved) : [];
    analyses.unshift(analysis); // Add to beginning
    
    localStorage.setItem('ai-analyses', JSON.stringify(analyses));
    setSavedAnalyses(analyses);
  };

  const deleteAnalysis = (id: string) => {
    const filtered = savedAnalyses.filter((a) => a.id !== id);
    localStorage.setItem('ai-analyses', JSON.stringify(filtered));
    setSavedAnalyses(filtered);
  };

  const handleAnalyze = () => {
    if (!selectedUserId) {
      alert('Lütfen bir personel seçin');
      return;
    }
    setShowModal(false);
    loadAIInsights();
  };

  const loadAIInsights = async () => {
    setIsLoadingAI(true);
    setCurrentInsight('');

    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const currentUser = JSON.parse(userStr);

      // Fetch data for selected user
      const params = new URLSearchParams();
      params.append('userId', selectedUserId);

      const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id,
        'X-User-Role': currentUser.role,
        'X-Store-Code': currentUser.store_code.toString(),
      };

      const response = await fetch(`/api/analytics/training-needs?${params}`, { headers });
      const result = await response.json();

      if (result.data) {
        // Get selected user name
        const selectedUser = users.find((u) => u.id === selectedUserId);
        const userName = selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Personel';

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
          setCurrentInsight(aiResult.data);
          saveAnalysis(selectedUserId, userName, aiResult.data);
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
    <AnalyticsGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">AI Eğitim Analizi</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Personel bazında yapay zeka destekli eğitim önerileri
          </p>
        </div>

        {/* Analyze Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            disabled={isLoadingAI}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI Analiz Ediliyor...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Yeni AI Analizi Yap
              </>
            )}
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold">AI Eğitim Analizi</h2>
              </div>

              <p className="text-gray-600 mb-4 text-sm">Hangi personel için AI analizi yapmak istersiniz?</p>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ⏱️ Bu analiz 20-30 saniye sürebilir. Lütfen bekleyin...
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Personel Seçin</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Personel seçin...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedUserId}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50"
                >
                  Analiz Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Insight */}
        {currentInsight && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-4 md:p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg md:text-xl font-bold text-purple-900">Son Analiz</h2>
            </div>
            <div className="prose prose-sm md:prose-base max-w-none">
              <div
                className="text-gray-800 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: currentInsight
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/^(.+)$/gm, '<p>$1</p>')
                    .replace(/^- /gm, '• '),
                }}
              />
            </div>
          </div>
        )}

        {/* Saved Analyses */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold">Bugünkü Analizler</h2>
            <span className="text-xs text-gray-500">Son 7 gün</span>
          </div>

          {savedAnalyses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Henüz analiz yapılmamış</p>
          ) : (
            <div className="space-y-3">
              {savedAnalyses.map((analysis) => (
                <div key={analysis.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{analysis.userName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {analysis.date}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAnalysis(analysis.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentInsight(analysis.content)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Analizi Görüntüle →
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnalyticsGuard>
  );
}
