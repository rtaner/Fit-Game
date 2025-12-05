import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary/upload';

// Force Node.js runtime to avoid body consumption issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Check if body is already consumed
  if (request.bodyUsed) {
    console.error('Request body already consumed (hot reload issue)');
    return NextResponse.json(
      { error: { code: 'PARSE_ERROR', message: 'Form verisi okunamadı. Lütfen tekrar deneyin.' } },
      { status: 400 }
    );
  }

  let formData: FormData;
  
  try {
    formData = await request.formData();
  } catch (error) {
    // This error happens when Next.js hot reload tries to re-process the request
    console.error('FormData parse error (likely hot reload):', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: { code: 'PARSE_ERROR', message: 'Form verisi okunamadı. Lütfen tekrar deneyin.' } },
      { status: 400 }
    );
  }

  try {
    const file = formData.get('file') as File;
    const customFilename = formData.get('filename') as string | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: 'NO_FILE', message: 'Dosya bulunamadı' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { code: 'INVALID_TYPE', message: 'Sadece resim dosyaları yüklenebilir' } },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'Dosya boyutu 5MB\'dan küçük olmalıdır' } },
        { status: 400 }
      );
    }

    // Determine upload folder
    const uploadFolder = folder === 'badges' 
      ? 'mavi-fit-game/badges' 
      : 'mavi-fit-game/questions';

    const result = await uploadImage(file, uploadFolder, customFilename || undefined);

    return NextResponse.json({
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Resim yüklenemedi';
    return NextResponse.json(
      { 
        error: { 
          code: 'UPLOAD_ERROR', 
          message: errorMessage,
          details: error instanceof Error ? error.stack : String(error)
        } 
      },
      { status: 500 }
    );
  }
}
