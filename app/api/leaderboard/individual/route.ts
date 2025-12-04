import { NextRequest, NextResponse } from 'next/server';
import { leaderboardService } from '@/services/leaderboard.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const timeFilter = (searchParams.get('timeFilter') || 'all') as 'week' | 'month' | 'all';

    const leaderboard = await leaderboardService.getIndividualLeaderboard(limit, timeFilter);

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Error fetching individual leaderboard:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Liderlik tablosu alınamadı' } },
      { status: 500 }
    );
  }
}
