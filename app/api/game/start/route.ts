import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/game.service';

export async function POST(request: NextRequest) {
  try {
    const { userId, categoryId } = await request.json();

    console.log('Game start request:', { userId, categoryId });

    if (!userId || !categoryId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'userId ve categoryId gerekli' } },
        { status: 400 }
      );
    }

    const session = await gameService.startGame(userId, categoryId);

    console.log('Session created:', session);

    if (!session) {
      return NextResponse.json(
        { error: { code: 'START_ERROR', message: 'Oyun başlatılamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        sessionId: session.id,
        question: session.currentQuestion,
        score: session.score,
        totalAvailableQuestions: session.totalAvailableQuestions || 0,
        lifeline50Used: session.lifeline50Used,
        lifelineSkipUsed: session.lifelineSkipUsed,
      },
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
