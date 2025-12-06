import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Category completion badge mapping
const CATEGORY_BADGES: Record<string, { code: string; name: string; emoji: string; description: string }> = {
  'denim-fit': {
    code: 'category_denim_fit',
    name: 'Denim Fit Ustası',
    emoji: '👖',
    description: 'Denim Fit kategorisindeki tüm soruları tamamladınız!'
  },
  'denim-sort': {
    code: 'category_denim_short',
    name: 'Denim Şort Uzmanı',
    emoji: '🩳',
    description: 'Denim Şort kategorisindeki tüm soruları tamamladınız!'
  },
  'koleksiyonlar': {
    code: 'category_collections',
    name: 'Koleksiyon Bilgini',
    emoji: '🎨',
    description: 'Koleksiyonlar kategorisindeki tüm soruları tamamladınız!'
  },
  'prosedurler': {
    code: 'category_procedures',
    name: 'Prosedür Profesyoneli',
    emoji: '📋',
    description: 'Prosedürler kategorisindeki tüm soruları tamamladınız!'
  },
  'all-categories': {
    code: 'category_all_champion',
    name: 'Tüm Kategoriler Şampiyonu',
    emoji: '🏆',
    description: 'Tüm Kategoriler modunda tüm soruları tamamladınız!'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, categoryId } = await request.json();

    if (!sessionId || !userId || !categoryId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'Eksik parametreler' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get category information
    const { data: category } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: { code: 'CATEGORY_NOT_FOUND', message: 'Kategori bulunamadı' } },
        { status: 404 }
      );
    }

    // Determine badge based on category
    let badgeInfo = null;
    
    // Check if category has a slug or use name to match
    const categoryKey = category.is_all_categories 
      ? 'all-categories' 
      : category.name.toLowerCase().replace(/\s+/g, '-');
    
    // Try to find matching badge
    for (const [key, badge] of Object.entries(CATEGORY_BADGES)) {
      if (categoryKey.includes(key) || key.includes(categoryKey)) {
        badgeInfo = badge;
        break;
      }
    }

    // If badge found, award it
    let badgeAwarded = null;
    if (badgeInfo) {
      // Check if badge definition exists
      const { data: badgeDef } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('code', badgeInfo.code)
        .single();

      if (badgeDef) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_badge_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_code', badgeInfo.code)
          .single();

        if (!existingBadge || !existingBadge.tier_unlocked) {
          // Award the badge
          if (existingBadge) {
            await supabase
              .from('user_badge_progress')
              .update({
                tier_unlocked: 'unlocked',
                unlocked_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingBadge.id);
          } else {
            await supabase.from('user_badge_progress').insert({
              user_id: userId,
              badge_code: badgeInfo.code,
              current_value: 1,
              tier_unlocked: 'unlocked',
              unlocked_at: new Date().toISOString(),
            });
          }

          badgeAwarded = {
            name: badgeInfo.name,
            emoji: badgeInfo.emoji,
            description: badgeInfo.description,
          };
        }
      }
    }

    // Reset asked_questions array for this session to allow replay
    await supabase
      .from('game_sessions')
      .update({ 
        asked_questions: [],
        used_colors: []
      })
      .eq('id', sessionId);

    return NextResponse.json({ 
      data: { 
        success: true,
        badgeAwarded,
        categoryName: category.name
      } 
    });
  } catch (error) {
    console.error('Error completing category:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Kategori tamamlanamadı' } },
      { status: 500 }
    );
  }
}
