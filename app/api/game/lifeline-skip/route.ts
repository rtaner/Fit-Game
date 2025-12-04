import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/game.service';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    const newQuestion = await gameService.useSkipLifeline(sessionId);

    if (!newQuestion) {
      return NextResponse.json(
        { error: { code: 'LIFELINE_ERROR', message: 'Joker kullanılamadı' } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { question: newQuestion } });
  } catch (error) {
    console.error('Error using skip:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
