import { NextRequest, NextResponse } from 'next/server';
import { analyzeTrainingNeeds } from '@/services/gemini.service';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get user from headers
    const userId = request.headers.get('X-User-Id');
    const userRole = request.headers.get('X-User-Role') as 'admin' | 'store_manager' | 'employee' | null;

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

    // Get training data from request body
    const data = await request.json();

    // Fetch all fit categories with details
    const supabase = createClient();
    const { data: fitCategories, error: fitError } = await supabase
      .from('question_items')
      .select('id, name, description, fit_category, tags, gender')
      .eq('is_active', true);

    if (fitError) {
      console.error('Error fetching fit categories:', fitError);
    }

    // Add fit data to analysis
    const enrichedData = {
      ...data,
      fitDatabase: fitCategories || [],
    };

    // Analyze with Gemini AI
    const insights = await analyzeTrainingNeeds(enrichedData);

    return NextResponse.json({ data: insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'AI analizi yapılırken bir hata oluştu' } },
      { status: 500 }
    );
  }
}
