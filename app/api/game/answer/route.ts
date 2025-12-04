import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/game.service';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, selectedAnswerId, responseTimeMs, lifelineUsed, questionColor } =
      await request.json();

    const result = await gameService.submitAnswer(
      sessionId,
      questionId,
      selectedAnswerId,
      responseTimeMs,
      lifelineUsed,
      questionColor
    );

    // TODO: Add badge checking logic here in the future
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Cevap gönderilemedi' } },
      { status: 500 }
    );
  }
}
