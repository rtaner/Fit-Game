import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';
import { getCurrentUserFromSession, getStoreFilterForUser, hasAnalyticsAccess } from '@/lib/utils/session';

export async function GET(request: NextRequest) {
  try {
    // Get user from headers (sent from client)
    const userId = request.headers.get('X-User-Id');
    const userRole = request.headers.get('X-User-Role') as 'admin' | 'store_manager' | 'employee' | null;
    const storeCode = request.headers.get('X-Store-Code');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Oturum bilgisi bulunamadı' } },
        { status: 401 }
      );
    }

    // Check if user has analytics access
    if (userRole !== 'admin' && userRole !== 'store_manager') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Bu sayfaya erişim yetkiniz yok' } },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Get store filter based on user role
    const userStoreFilter = userRole === 'store_manager' ? storeCode : undefined;

    const filters = {
      startDate,
      endDate,
      // Store managers can only see their own store
      storeId: userStoreFilter || undefined,
    };

    const [categoryNeeds, confusedFits, failedFits, storeComparison] = await Promise.all([
      analyticsService.getCategoryTrainingNeeds(filters),
      analyticsService.getMostConfusedFits(filters),
      analyticsService.getMostFailedFits(filters),
      analyticsService.getStoreComparison(filters),
    ]);

    return NextResponse.json({
      data: {
        categoryNeeds,
        confusedFits: confusedFits.slice(0, 10),
        failedFits: failedFits.slice(0, 10),
        storeComparison,
      },
    });
  } catch (error) {
    console.error('Error fetching training needs:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Eğitim ihtiyaçları alınamadı' } },
      { status: 500 }
    );
  }
}
