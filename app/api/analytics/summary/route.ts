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

    const summary = await analyticsService.getSummary(filters);

    if (!summary) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Özet verisi bulunamadı' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Özet verisi alınamadı' } },
      { status: 500 }
    );
  }
}
