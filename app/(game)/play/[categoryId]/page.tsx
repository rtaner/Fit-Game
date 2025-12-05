'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Percent, Clock, ThumbsUp, Trophy, RotateCcw, Home, AlertTriangle, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { GameQuestion } from '@/services/game.service';
import BadgeCelebration from '@/components/BadgeCelebration';

export default function PlayPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streakLevel, setStreakLevel] = useState<{ level: string; emoji: string; color: string }>({ level: 'Başlangıç', emoji: '💪', color: 'gray' });
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lifeline50Used, setLifeline50Used] = useState(false);
  const [lifelineSkipUsed, setLifelineSkipUsed] = useState(false);
  const [jokerFailedThisGame, setJokerFailedThisGame] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fitName, setFitName] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [userAnswerName, setUserAnswerName] = useState<string | null>(null);
  const [userAnswerExplanation, setUserAnswerExplanation] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLifelineModal, setShowLifelineModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    // Resolve params first (Next.js 15+ requirement)
    params.then((resolvedParams) => {
      setCategoryId(resolvedParams.categoryId);
      
      // Try to get user from store or localStorage
      let currentUser = user;
      if (!currentUser) {
        const stored = localStorage.getItem('current-user');
        if (stored) {
          currentUser = JSON.parse(stored);
        }
      }

      if (currentUser) {
        startGameWithUser(currentUser, resolvedParams.categoryId);
      }
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (!question || selectedAnswer || showResult || gameOver) {
      return;
    }

    setTimeLeft(8);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Süre doldu, otomatik yanlış cevap
          if (!selectedAnswer) {
            handleTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, selectedAnswer, showResult, gameOver]);

  const handleTimeUp = async () => {
    if (!sessionId || !question) return;

    setShowResult(true);
    setIsCorrect(false);
    setTotalQuestions(prev => prev + 1); // Increment total questions
    
    // Find correct answer details
    const correctOption = question.options.find(opt => opt.id === question.correctAnswerId);
    
    // Store game over data
    setFitName(correctOption?.name ?? null);
    setExplanation(correctOption ? (question.description ?? null) : null);
    setUserAnswerName(null);
    setUserAnswerExplanation('⏱️ Süre Bitti!');
    
    setTimeout(async () => {
      // Check for badges first
      const hasBadges = await checkForNewBadges();
      
      // Only show game over if no badges were unlocked
      // If badges exist, game over will be shown after badge celebration closes
      if (!hasBadges) {
        setTimeout(() => {
          setGameOver(true);
        }, 500);
      }
    }, 1000);
  };

  const startGameWithUser = async (currentUser: any, catId: string) => {
    if (!currentUser) {
      console.error('User not found');
      return;
    }

    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          categoryId: catId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSessionId(result.data.sessionId);
        setQuestion(result.data.question);
        setScore(result.data.score);
        setTotalAvailableQuestions(result.data.totalAvailableQuestions || 0);
        setLifeline50Used(result.data.lifeline50Used);
        setLifelineSkipUsed(result.data.lifelineSkipUsed);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (answerId: string) => {
    if (!sessionId || !question || selectedAnswer) return;

    setSelectedAnswer(answerId);
    setTotalQuestions(prev => prev + 1); // Increment total questions

    const startTime = Date.now();
    const responseTime = Date.now() - startTime;

    try {
      const response = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.questionId,
          selectedAnswerId: answerId,
          responseTimeMs: responseTime,
          questionColor: question.color || 'default', // Renk bilgisini gönder
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsCorrect(result.data.isCorrect);
        setShowResult(true);
        setScore(result.data.newScore);
        setCurrentStreak(result.data.currentStreak || 0);
        setMultiplier(result.data.multiplier || 1);
        setPointsEarned(result.data.pointsEarned || 0);
        setStreakLevel(result.data.streakLevel || { level: 'Başlangıç', emoji: '💪', color: 'gray' });
        
        // Show streak animation if multiplier changed
        if (result.data.isCorrect && result.data.multiplier > multiplier) {
          setShowStreakAnimation(true);
          setTimeout(() => setShowStreakAnimation(false), 2000);
        }
        
        // Update highest streak
        if (result.data.currentStreak > highestStreak) {
          setHighestStreak(result.data.currentStreak);
        }

        if (!result.data.isCorrect) {
          // Track if joker was used and failed
          if (lifeline50Used) {
            setJokerFailedThisGame(true);
          }
          
          // Find user's selected answer details from question options
          const userSelectedOption = question.options.find(opt => opt.id === answerId);
          
          // Store game over data
          setFitName(result.data.fitName);
          setExplanation(result.data.explanation);
          setUserAnswerName(userSelectedOption?.name ?? null);
          setUserAnswerExplanation(result.data.userAnswerExplanation ?? null);
          
          // Kırmızı rengi göstermek için kısa bir gecikme
          setTimeout(async () => {
            // Check for badges first
            const hasBadges = await checkForNewBadges();
            
            // Only show game over if no badges were unlocked
            // If badges exist, game over will be shown after badge celebration closes
            if (!hasBadges) {
              setTimeout(() => {
                setGameOver(true);
              }, 500);
            }
          }, 1000);
        } else {
          setTimeout(() => {
            setQuestion(result.data.nextQuestion);
            setSelectedAnswer(null);
            setShowResult(false);
            setIsCorrect(false);
          }, 800);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleUse5050 = async () => {
    if (!sessionId || !question || lifeline50Used) return;

    try {
      const response = await fetch('/api/game/lifeline-5050', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question }),
      });

      const result = await response.json();

      if (response.ok) {
        setQuestion(result.data.question);
        setLifeline50Used(true);
      }
    } catch (error) {
      console.error('Error using 50-50:', error);
    }
  };

  const handleUseSkip = async () => {
    if (!sessionId || lifelineSkipUsed || !categoryId) return;

    try {
      const response = await fetch('/api/game/lifeline-skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, categoryId }),
      });

      const result = await response.json();

      if (response.ok) {
        setQuestion(result.data.question);
        setLifelineSkipUsed(true);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error using skip:', error);
    }
  };

  const handleReportError = async () => {
    if (!user || !question || !reportText.trim()) return;

    try {
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          questionId: question.questionId,
          reportText: reportText.trim(),
        }),
      });

      if (response.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setReportText('');
          setReportSubmitted(false);
          setShowReportModal(false);
        }, 1500);
      } else {
        alert('Hata raporu gönderilemedi');
      }
    } catch (error) {
      console.error('Error reporting:', error);
      alert('Bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Oyun başlatılıyor...</div>
      </div>
    );
  }

  const checkForNewBadges = async (): Promise<boolean> => {
    if (!user || !sessionId) return false;

    try {
      const response = await fetch('/api/badges/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          eventType: 'game_end',
          eventData: {
            sessionId,
            score,
            highestStreak,
            totalQuestions,
            averageResponseTime: 3000, // TODO: Track actual response time
            timeLeft: timeLeft,
            jokerUsed: lifeline50Used,
            jokerFailed: jokerFailedThisGame, // Track if joker was used and game ended with wrong answer
            isGameEnd: true,
          }
        }),
      });

      const result = await response.json();

      console.log('🔍 Badge check result:', result);
      console.log('🔍 Unlocked badges:', result.data?.unlockedBadges);
      console.log('🔍 Has new badges:', result.data?.hasNewBadges);

      if (response.ok && result.data?.unlockedBadges && result.data.unlockedBadges.length > 0) {
        console.log('🎉 New badges unlocked:', result.data.unlockedBadges);
        setUnlockedBadges(result.data.unlockedBadges);
        setShowBadgeCelebration(true);
        console.log('🎉 Badge celebration should show now!');
        return true; // Badges found
      } else {
        console.log('❌ No new badges to show');
        return false; // No badges
      }
    } catch (error) {
      console.error('Error checking badges:', error);
      return false;
    }
  };

  // Dynamic feedback based on success percentage
  const getFeedbackLevel = (score: number, totalAvailable: number) => {
    if (totalAvailable === 0) return null;
    
    const percentage = (score / totalAvailable) * 100;
    
    if (percentage >= 90) {
      return {
        level: 5,
        title: 'EFSANE!',
        subtitle: 'Kusursuz! Tüm fitlere hakimsin. Gerçek bir denim efsanesisin.',
        emoji: '👑',
        showConfetti: true,
      };
    } else if (percentage >= 75) {
      return {
        level: 4,
        title: 'DENİM UZMANI!',
        subtitle: 'Mükemmel! Çoğu fite hakimsin. Gerçek bir denim ustasısın.',
        emoji: '🏆',
        showConfetti: false,
      };
    } else if (percentage >= 55) {
      return {
        level: 3,
        title: 'GÜZEL GİDİYORSUN!',
        subtitle: 'Çoğu fiti öğrendin. Biraz daha dikkatle ustalığa ulaşabilirsin.',
        emoji: '🎯',
        showConfetti: false,
      };
    } else if (percentage >= 30) {
      return {
        level: 2,
        title: 'İYİ BAŞLANGIÇ!',
        subtitle: 'Henüz yolun başındasın. Tekrar dene ve kendini geliştir.',
        emoji: '💪',
        showConfetti: false,
      };
    } else {
      return {
        level: 1,
        title: 'PES ETMEK YOK!',
        subtitle: 'Eğitim bölümünü ziyaret ederek fitleri öğrenebilirsin.',
        emoji: '📚',
        showConfetti: false,
      };
    }
  };

  const handlePlayAgain = () => {
    // Reset all game state
    setGameOver(false);
    setSessionId(null);
    setQuestion(null);
    setScore(0);
    setTotalQuestions(0);
    setTotalAvailableQuestions(0);
    setCurrentStreak(0);
    setHighestStreak(0);
    setMultiplier(1);
    setPointsEarned(0);
    setStreakLevel({ level: 'Başlangıç', emoji: '💪', color: 'gray' });
    setUnlockedBadges([]);
    setJokerFailedThisGame(false);
    setShowBadgeCelebration(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setLifeline50Used(false);
    setLifelineSkipUsed(false);
    setFitName(null);
    setExplanation(null);
    setIsLoading(true);

    // Check for new badges
    checkForNewBadges();

    // Restart game
    params.then((resolvedParams) => {
      let currentUser = user;
      if (!currentUser) {
        const stored = localStorage.getItem('current-user');
        if (stored) {
          currentUser = JSON.parse(stored);
        }
      }

      if (currentUser) {
        startGameWithUser(currentUser, resolvedParams.categoryId);
      }
    });
  };

  if (gameOver) {
    // Use totalQuestions (correct answers) for feedback, not score (points)
    const feedback = getFeedbackLevel(totalQuestions, totalAvailableQuestions);
    const timedOut = !userAnswerName && userAnswerExplanation;

    return (
      <main className="h-screen max-h-screen overflow-hidden bg-slate-50 flex flex-col px-5 py-6">
        {/* Header Section */}
        <div className="flex-none flex flex-col items-center">
          {timedOut ? (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Süre Bitti!</h1>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <ThumbsUp className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">{feedback?.title || 'Oyun Bitti!'}</h1>
            </>
          )}
          <p className="text-slate-500 text-xs mt-1">{feedback?.subtitle || 'Skorun'}</p>
        </div>

        {/* Score Card */}
        <div className="flex-none w-full bg-blue-600 rounded-2xl py-4 mt-4 shadow-lg">
          <p className="text-4xl font-bold text-white text-center">{score}</p>
          <p className="text-blue-100 text-xs text-center mt-1">{totalQuestions} Doğru Cevap</p>
        </div>

        {/* Highest Streak Display */}
        {highestStreak > 0 && (
          <div className="flex-none w-full bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mt-2 border border-orange-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🔥</span>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-600">{highestStreak}</p>
                <p className="text-xs text-slate-600">En Yüksek Seri</p>
              </div>
            </div>
          </div>
        )}

        {/* Answer Comparison */}
        <div className="flex-none w-full space-y-2 mt-4">
          {timedOut ? (
            <>
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="text-red-600 font-semibold text-center text-sm">Süre Bitti</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <p className="text-slate-500 text-xs mb-0.5">Doğru Cevap:</p>
                <p className="text-emerald-600 font-bold">{fitName}</p>
                {explanation && <p className="text-emerald-700 text-xs">{explanation}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <p className="text-slate-500 text-xs mb-0.5">Doğru Cevap:</p>
                <p className="text-emerald-600 font-bold">{fitName}</p>
                {explanation && <p className="text-emerald-700 text-xs">{explanation}</p>}
              </div>
              {userAnswerName && (
                <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                  <p className="text-slate-500 text-xs mb-0.5">Senin Cevabın:</p>
                  <p className="text-red-600 font-bold">{userAnswerName}</p>
                  {userAnswerExplanation && <p className="text-red-700 text-xs">{userAnswerExplanation}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Action Buttons */}
        <div className="flex-none w-full space-y-2">
          <button
            onClick={handlePlayAgain}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Tekrar Oyna
          </button>

          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Liderlik Tablosu
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </button>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Soru yüklenemedi</div>
      </div>
    );
  }

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-slate-50 flex flex-col relative">
      {/* Fire Effect for Streak 21+ */}
      {currentStreak >= 21 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top corners fire */}
          <div className="absolute top-0 left-0 w-20 h-20">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl"
            >
              {currentStreak >= 41 ? '🚀' : '🔥'}
            </motion.div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 flex justify-end">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
              className="text-6xl"
            >
              {currentStreak >= 41 ? '🚀' : '🔥'}
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Streak Level Up Animation */}
      {showStreakAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
            <div className="text-4xl mb-2">{streakLevel.emoji}</div>
            <div className="text-2xl font-bold">{streakLevel.level}!</div>
            <div className="text-lg">x{multiplier} Çarpan</div>
          </div>
        </motion.div>
      )}
      
      {/* Joker Modal */}
      {showLifelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowLifelineModal(false)} 
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-sm mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Joker Seç</h2>
              <button 
                onClick={() => setShowLifelineModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Joker Options */}
            <div className="p-4 space-y-3">
              {/* %50 Joker */}
              <button
                onClick={() => {
                  handleUse5050();
                  setShowLifelineModal(false);
                }}
                disabled={lifeline50Used}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-slate-900">%50 Eleme</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Yanlış seçeneklerin yarısını ele</p>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold text-purple-600">{lifeline50Used ? 0 : 1}</span>
                </div>
              </button>

              {/* Skip Joker */}
              <button
                onClick={() => {
                  handleUseSkip();
                  setShowLifelineModal(false);
                }}
                disabled={lifelineSkipUsed}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-slate-900">Süreyi Dondur</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Bu soru için süre duracak</p>
                </div>
                <div className="bg-cyan-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold text-cyan-600">{lifelineSkipUsed ? 0 : 1}</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <p className="text-xs text-center text-slate-400">Jokerleri akıllıca kullan!</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Badge Celebration Modal */}
      {showBadgeCelebration && unlockedBadges.length > 0 && (
        <BadgeCelebration
          unlockedBadges={unlockedBadges}
          userId={user?.id}
          onClose={() => {
            setShowBadgeCelebration(false);
            setUnlockedBadges([]);
            // Show game over screen after badge celebration closes
            setGameOver(true);
          }}
        />
      )}

      {/* Error Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => {
              setShowReportModal(false);
              setReportText('');
              setReportSubmitted(false);
            }} 
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-sm mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {reportSubmitted ? (
              // Success State
              <div className="p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Teşekkürler!</h2>
                <p className="text-sm text-slate-500 mt-1">Bildiriminiz alındı</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h2 className="text-lg font-bold text-slate-900">Hata Bildir</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setShowReportModal(false);
                      setReportText('');
                    }} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Question Info */}
                <div className="px-4 pt-4">
                  <p className="text-xs text-slate-500 mb-1">İlgili Soru:</p>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {/* Fit Name (Correct Answer) */}
                    {question?.options && question.correctAnswerId && (
                      <p className="text-base font-bold text-slate-900 mb-1">
                        {question.options.find(opt => opt.id === question.correctAnswerId)?.name}
                      </p>
                    )}
                    {/* Fit Description */}
                    <p className="text-sm font-medium text-slate-700">{question?.description || question?.questionText}</p>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4">
                  <label className="text-xs text-slate-500 mb-1.5 block">Hatayı açıklayın:</label>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Soruda veya cevaplarda gördüğünüz hatayı açıklayın..."
                    className="w-full h-24 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-mavi-navy/20 focus:border-mavi-navy"
                  />
                </div>

                {/* Submit Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={handleReportError}
                    disabled={!reportText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Gönder
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Header with Score and Buttons */}
      <header className="flex-none px-3 pt-3 pb-2 bg-slate-50">
        <div className="flex items-center justify-between">
          {/* Score */}
          <div className="flex items-center gap-1.5">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-base font-bold text-slate-800">{score}</span>
            
            {/* Streak Counter */}
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full ml-1"
              >
                <span className="text-sm">{streakLevel.emoji}</span>
                <span className="text-xs font-bold text-orange-700">{currentStreak}</span>
              </motion.div>
            )}
            
            {/* Multiplier Badge */}
            {multiplier > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-0.5 rounded-full font-bold text-xs ml-1 ${
                  multiplier >= 5 ? 'bg-purple-500 text-white' :
                  multiplier >= 3 ? 'bg-orange-500 text-white' :
                  multiplier >= 2 ? 'bg-red-500 text-white' :
                  multiplier >= 1.5 ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}
              >
                x{multiplier}
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Joker button */}
            <button
              onClick={() => setShowLifelineModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 rounded-full shadow-sm"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" className="text-white/30" fill="currentColor" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="white" />
                <circle cx="9" cy="10" r="1.5" fill="white" />
                <circle cx="15" cy="10" r="1.5" fill="white" />
                <path d="M12 16c-1.48 0-2.75-.81-3.45-2h6.9c-.7 1.19-1.97 2-3.45 2z" fill="white" />
              </svg>
              <span className="text-xs font-semibold text-white">Joker</span>
            </button>

            {/* Report Error button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-400 rounded-full shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-rose-500">Hata Bildir</span>
            </button>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
          <motion.div
            className={`h-full transition-all duration-200 ease-linear rounded-full ${
              timeLeft <= 3 ? 'bg-rose-500' : timeLeft <= 5 ? 'bg-orange-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${(timeLeft / 8) * 100}%` }}
          />
        </div>
      </header>

      {/* Question Text */}
      <section className="flex-none py-2 px-4">
        <h2 className="text-base font-bold text-slate-800 text-center leading-snug">
          {question.description || question.questionText}
        </h2>
      </section>

      {/* Answer Buttons */}
      <section className="flex-none px-3 pb-2 flex flex-col gap-1.5">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isDisabled = selectedAnswer !== null;
          const isCorrectAnswer = showResult && isCorrect && isSelected;
          const isWrongAnswer = showResult && !isCorrect && isSelected;
          
          return (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={isDisabled}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2.5 transition-all duration-200 ease-out active:scale-[0.98] disabled:active:scale-100 touch-manipulation select-none ${
                isCorrectAnswer
                  ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/30'
                  : isWrongAnswer
                  ? 'bg-rose-500 text-white border-transparent shadow-md shadow-rose-500/30'
                  : isSelected
                  ? 'bg-slate-800 text-white border-transparent shadow-md shadow-slate-800/25'
                  : isDisabled
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed'
                  : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCorrectAnswer || isWrongAnswer || isSelected
                    ? 'bg-white/20 text-white'
                    : isDisabled
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isCorrectAnswer ? '✓' : isWrongAnswer ? '✕' : String.fromCharCode(65 + index)}
              </span>
              <span className="text-left">{option.name}</span>
            </button>
          );
        })}
      </section>

      {/* Product Image */}
      <section className="flex-1 min-h-0">
        <div className="relative w-full h-full bg-white rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <img
            src={question.imageUrl}
            alt="Ürün görseli"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>
    </main>
  );
}
