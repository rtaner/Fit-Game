import { NextRequest, NextResponse } from 'next/server';
import { leaderboardService } from '@/services/leaderboard.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    const leaderboard = await leaderboardService.getStoreLeaderboard(limit);

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Error fetching store leaderboard:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Mağaza liderlik tablosu alınamadı' } },
      { status: 500 }
    );
  }
}
