import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/services/streak.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'userId gerekli' } },
        { status: 400 }
      );
    }

    const streak = await streakService.updateStreak(userId);

    return NextResponse.json({ data: streak });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Streak güncellenemedi' } },
      { status: 500 }
    );
  }
}
