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

    const tagPerformance = await analyticsService.getTagPerformance(filters);

    return NextResponse.json({ data: tagPerformance });
  } catch (error) {
    console.error('Error fetching tag performance:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Tag performansı alınamadı' } },
      { status: 500 }
    );
  }
}
