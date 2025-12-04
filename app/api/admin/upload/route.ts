import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary/upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customFilename = formData.get('filename') as string | null;

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

    const result = await uploadImage(file, 'mavi-fit-game/questions', customFilename || undefined);

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
    return NextResponse.json(
      { error: { code: 'UPLOAD_ERROR', message: 'Resim yüklenemedi' } },
      { status: 500 }
    );
  }
}
