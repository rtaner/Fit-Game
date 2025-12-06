'use client';

import { useRouter } from 'next/navigation';

interface CompletionModalProps {
  categoryName: string;
  totalScore: number;
  highestStreak: number;
  totalQuestions: number;
  badgeEarned?: {
    name: string;
    emoji: string;
    description: string;
  };
  onPlayAgain: () => void;
}

export function CompletionModal({
  categoryName,
  totalScore,
  highestStreak,
  totalQuestions,
  badgeEarned,
  onPlayAgain,
}: CompletionModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 max-w-md w-full text-white shadow-2xl">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Tebrikler!</h2>
          <p className="text-lg opacity-90">
            {categoryName} kategorisindeki tüm soruları tamamladınız!
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white/10 rounded-xl p-6 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Toplam Puan:</span>
            <span className="text-2xl font-bold">{totalScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">En Yüksek Seri:</span>
            <span className="text-2xl font-bold">{highestStreak}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Toplam Soru:</span>
            <span className="text-2xl font-bold">{totalQuestions}</span>
          </div>
        </div>

        {/* Badge Earned */}
        {badgeEarned && (
          <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
            <div className="text-4xl mb-2">{badgeEarned.emoji}</div>
            <h3 className="text-xl font-bold mb-1">{badgeEarned.name}</h3>
            <p className="text-sm text-white/80">{badgeEarned.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-white text-purple-600 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors"
          >
            🔄 Tekrar Oyna
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition-colors"
          >
            🏠 Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
