import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Kullanıcı ID gerekli' } },
        { status: 400 }
      );
    }

    const weakPoints = await analyticsService.getUserWeakPoints(userId, {
      startDate,
      endDate,
    });

    return NextResponse.json({ data: weakPoints });
  } catch (error) {
    console.error('Error fetching user weak points:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Kullanıcı zayıf noktaları alınamadı' } },
      { status: 500 }
    );
  }
}
