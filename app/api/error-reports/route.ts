import { NextRequest, NextResponse } from 'next/server';
import { errorReportService } from '@/services/error-report.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    const reports = await errorReportService.getReports(status);

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Raporlar alınamadı' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, reportText } = await request.json();

    if (!userId || !questionId || !reportText) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Eksik bilgi' } },
        { status: 400 }
      );
    }

    const report = await errorReportService.createReport(userId, questionId, reportText);

    if (!report) {
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Rapor oluşturulamadı' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reportId, status, adminNotes } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Eksik bilgi' } },
        { status: 400 }
      );
    }

    const report = await errorReportService.updateReportStatus(reportId, status, adminNotes);

    if (!report) {
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Rapor güncellenemedi' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Sunucu hatası' } },
      { status: 500 }
    );
  }
}
