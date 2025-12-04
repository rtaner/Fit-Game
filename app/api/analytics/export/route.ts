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

    const exportData = await analyticsService.exportForAI(filters);

    if (!exportData) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Export verisi bulunamadı' } },
        { status: 404 }
      );
    }

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Export işlemi başarısız' } },
      { status: 500 }
    );
  }
}
