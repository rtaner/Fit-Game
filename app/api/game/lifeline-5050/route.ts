import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/game.service';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, question } = await request.json();

    const updatedQuestion = await gameService.use5050Lifeline(sessionId, question);

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: { code: 'LIFELINE_ERROR', message: 'Joker kullanılamadı' } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { question: updatedQuestion } });
  } catch (error) {
    console.error('Error using 50-50:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
