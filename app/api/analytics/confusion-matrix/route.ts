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

    const confusionMatrix = await analyticsService.getConfusionMatrix(filters);

    return NextResponse.json({ data: confusionMatrix });
  } catch (error) {
    console.error('Error fetching confusion matrix:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Confusion matrix alınamadı' } },
      { status: 500 }
    );
  }
}
