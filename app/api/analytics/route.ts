import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      storeId: searchParams.get('storeId') || undefined,
      userId: searchParams.get('userId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
    };

    const analytics = await analyticsService.getAnalytics(filters);

    if (!analytics) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Analytics verisi bulunamadı' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Analytics verisi alınamadı' } },
      { status: 500 }
    );
  }
}
