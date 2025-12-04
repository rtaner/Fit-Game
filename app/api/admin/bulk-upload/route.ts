import { NextRequest, NextResponse } from 'next/server';
import { bulkUploadService } from '@/services/bulk-upload.service';

export async function POST(request: NextRequest) {
  try {
    console.log('\n🚀 ===== BULK UPLOAD STARTED =====');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('category_id') as string;

    console.log('📦 Request data:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      categoryId
    });

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: { code: 'NO_FILE', message: 'Dosya bulunamadı' } },
        { status: 400 }
      );
    }

    if (!categoryId) {
      console.error('❌ No category provided');
      return NextResponse.json(
        { error: { code: 'NO_CATEGORY', message: 'Kategori seçilmedi' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      console.error('❌ Invalid file type:', file.name);
      return NextResponse.json(
        { error: { code: 'INVALID_TYPE', message: 'Sadece CSV dosyaları desteklenir' } },
        { status: 400 }
      );
    }

    console.log('📄 Parsing CSV file...');
    
    // Parse CSV
    const rows = await bulkUploadService.parseCSV(file);

    console.log(`✅ CSV parsed: ${rows.length} rows found`);

    if (rows.length === 0) {
      console.error('❌ No rows in file');
      return NextResponse.json(
        { error: { code: 'EMPTY_FILE', message: 'Dosya boş' } },
        { status: 400 }
      );
    }

    console.log('💾 Starting bulk create...');
    
    // Bulk create
    const result = await bulkUploadService.bulkCreateQuestions(categoryId, rows);

    console.log('✅ ===== BULK UPLOAD COMPLETED =====\n');

    return NextResponse.json({
      data: {
        total: rows.length,
        success: result.success,
        errors: result.errors.length,
        errorDetails: result.errors,
      },
    });
  } catch (error) {
    console.error('❌ ===== BULK UPLOAD FAILED =====');
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: { code: 'UPLOAD_ERROR', message: 'Toplu yükleme başarısız' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const template = bulkUploadService.generateTemplate();
    
    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template.csv"',
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: { code: 'TEMPLATE_ERROR', message: 'Şablon oluşturulamadı' } },
      { status: 500 }
    );
  }
}
