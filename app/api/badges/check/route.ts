import { NextRequest, NextResponse } from 'next/server';
import { badgeService } from '@/services/badge.service';

export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, eventData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'userId gerekli' } },
        { status: 400 }
      );
    }

    let unlockedBadges: any[] = [];

    // Check badges based on event type
    if (eventType === 'game_end' && eventData) {
      // Get session data from eventData
      const gameData = {
        score: eventData.score || 0,
        highestStreak: eventData.highestStreak || 0,
        averageResponseTime: eventData.averageResponseTime || 3000,
        totalQuestions: eventData.totalQuestions || 0,
        timeLeft: eventData.timeLeft || 0,
        jokerUsed: eventData.jokerUsed || false,
        jokerFailed: eventData.jokerFailed || false,
      };

      // Check game badges
      const badges = await badgeService.checkGameBadges(
        userId,
        eventData.sessionId || '',
        gameData
      );

      // Format badges for frontend
      unlockedBadges = badges.map(unlock => ({
        badgeCode: unlock.badge.code,
        badge: {
          name: unlock.badge.name,
          description: unlock.badge.description,
          emoji: unlock.badge.emoji,
          tier: unlock.badge.tier,
        },
        tierUnlocked: unlock.progress.tier_unlocked,
        isNewUnlock: unlock.isNew,
        message: getBadgeMessage(unlock.badge.code, unlock.progress.current_value),
      }));
    }

    return NextResponse.json({ 
      data: { 
        unlockedBadges,
        hasNewBadges: unlockedBadges.length > 0,
      } 
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Badge kontrolü başarısız' } },
      { status: 500 }
    );
  }
}

// Helper function to generate custom messages for badges
function getBadgeMessage(badgeCode: string, value: number): string {
  const messages: Record<string, string> = {
    // Streak badges
    streak_10: `${value} doğru cevap üst üste! Harika bir başlangıç!`,
    streak_15: `${value} doğru cevap üst üste! Muhteşem bir performans!`,
    streak_20: `${value} doğru cevap üst üste! İnanılmaz bir seri!`,
    streak_30: `${value} doğru cevap üst üste! Efsane bir performans!`,
    streak_40: `${value} doğru cevap üst üste! Durdurulamaz bir güç!`,
    streak_50: `${value} doğru cevap üst üste! Kusursuz bir ustalık!`,
    
    // Speed badges
    lightning_speed_bronze: `Ortalama ${(value / 1000).toFixed(1)}s cevap süresi! Hızlısın!`,
    lightning_speed_silver: `Ortalama ${(value / 1000).toFixed(1)}s cevap süresi! Çok hızlısın!`,
    lightning_speed_gold: `Ortalama ${(value / 1000).toFixed(1)}s cevap süresi! Şimşek gibisin!`,
    
    // Veteran badges
    veteran_bronze: `${value} soru cevapladın! Deneyim kazanıyorsun!`,
    veteran_silver: `${value} soru cevapladın! Gerçek bir emektarsın!`,
    veteran_gold: `${value} soru cevapladın! Efsane bir emektar!`,
    
    // Point hunter badges
    point_hunter_bronze: `${value} puan topladın! İyi bir başlangıç!`,
    point_hunter_silver: `${value} puan topladın! Harika bir avcı!`,
    point_hunter_gold: `${value} puan topladın! Efsane bir avcı!`,
    
    // Daily routine badges
    daily_routine_bronze: `${value} gün üst üste giriş! Güzel bir rutin!`,
    daily_routine_silver: `${value} gün üst üste giriş! Harika bir disiplin!`,
    daily_routine_gold: `${value} gün üst üste giriş! Efsane bir kararlılık!`,
    
    // Education badges
    education_lover_bronze: `${Math.floor(value / 60)} dakika eğitim! Öğrenmeyi seviyorsun!`,
    education_lover_silver: `${Math.floor(value / 60)} dakika eğitim! Gerçek bir eğitim aşığı!`,
    education_lover_gold: `${Math.floor(value / 60)} dakika eğitim! Efsane bir öğrenci!`,
    
    // Secret badges
    flawless_human: 'Hatasız kul olmaz ama sen çok yaklaştın! 😅',
    night_owl: 'Gece kuşu! Gece yarısı çalışmak sana göre!',
    unlucky: 'Joker bile yardım edemedi! Bazen şans yaver gitmez! 😅',
    last_second_goal: 'Son saniye golü! Tam zamanında!',
    ninja: 'Ninja gibi hızlısın! 4 doğru cevap 10 saniyede!',
  };

  return messages[badgeCode] || 'Tebrikler! Yeni bir rozet kazandın!';
}
