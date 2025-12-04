'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  badgeCode: string;
  badge: {
    name: string;
    description: string;
    emoji: string;
    tier?: string;
  };
  tierUnlocked?: string;
  isNewUnlock: boolean;
  message: string;
}

interface BadgeCelebrationProps {
  unlockedBadges: Badge[];
  onClose: () => void;
}

export default function BadgeCelebration({ unlockedBadges, onClose }: BadgeCelebrationProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (unlockedBadges.length === 0) return;

    // Auto-advance to next badge after 3 seconds
    const timer = setTimeout(() => {
      if (currentBadgeIndex < unlockedBadges.length - 1) {
        setCurrentBadgeIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentBadgeIndex, unlockedBadges.length, onClose]);

  if (unlockedBadges.length === 0) return null;

  const currentBadge = unlockedBadges[currentBadgeIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -20, 
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'linear'
                }}
                className="absolute text-2xl"
              >
                {['🎉', '⭐', '✨', '🎊', '💫', '🏆'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>
        )}

        {/* Badge Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Badge Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="text-8xl mb-4"
          >
            {currentBadge.badge.emoji}
          </motion.div>

          {/* Badge Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            🎉 Tebrikler!
          </motion.h2>

          {/* Badge Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-2">
              {currentBadge.badge.name}
              {currentBadge.badge.tier && (
                <span className={`ml-2 text-lg px-3 py-1 rounded-full ${
                  currentBadge.badge.tier === 'gold' ? 'bg-yellow-200 text-yellow-800' :
                  currentBadge.badge.tier === 'silver' ? 'bg-gray-200 text-gray-800' :
                  'bg-orange-200 text-orange-800'
                }`}>
                  {currentBadge.badge.tier === 'gold' ? '🥇 Altın' : 
                   currentBadge.badge.tier === 'silver' ? '🥈 Gümüş' : 
                   '🥉 Bronz'}
                </span>
              )}
            </h3>
            <p className="text-gray-600">{currentBadge.badge.description}</p>
          </motion.div>

          {/* Custom Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl mb-6"
          >
            <p className="text-gray-700 font-medium">{currentBadge.message}</p>
          </motion.div>

          {/* Progress Indicator */}
          {unlockedBadges.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-2 mb-4"
            >
              {unlockedBadges.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentBadgeIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            {currentBadgeIndex < unlockedBadges.length - 1 ? (
              <>
                <button
                  onClick={() => setCurrentBadgeIndex(prev => prev + 1)}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-2xl font-bold hover:bg-blue-600 transition-colors active:scale-95"
                >
                  Sonraki Rozet
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors active:scale-95"
                >
                  Atla
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all active:scale-95"
              >
                Harika! 🎉
              </button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
