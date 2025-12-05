import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Clean filename - remove Turkish characters and special chars
 */
function cleanFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  folder: string = 'mavi-fit-game',
  customFilename?: string
): Promise<CloudinaryUploadResult> {
  let uploadData: string;
  let fileType: string | undefined;
  let fileName: string | undefined;

  // Convert file to base64 first, before any try-catch
  if (typeof file === 'string') {
    uploadData = file;
  } else {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
      fileType = file.type;
      fileName = file.name;
    } catch (error) {
      console.error('File read error:', error);
      throw new Error('Dosya okunamadı');
    }
  }

  const uploadOptions: any = {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  try {

    // Eğer custom filename verilmişse kullan (temizlenmiş halde)
    if (customFilename) {
      uploadOptions.public_id = cleanFilename(customFilename);
      uploadOptions.use_filename = false;
      uploadOptions.unique_filename = false;
    } else if (fileName) {
      // Dosya adını otomatik temizle
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      uploadOptions.public_id = cleanFilename(nameWithoutExt);
      uploadOptions.use_filename = false;
      uploadOptions.unique_filename = true; // Aynı isimde dosya varsa unique yap
    }

    console.log('Uploading to Cloudinary with options:', {
      folder: uploadOptions.folder,
      public_id: uploadOptions.public_id,
      use_filename: uploadOptions.use_filename,
      unique_filename: uploadOptions.unique_filename,
    });

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);

    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Upload options were:', uploadOptions);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      throw new Error(`Cloudinary yükleme hatası: ${error.message}`);
    }
    throw new Error('Resim yüklenemedi');
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Resim silinemedi');
  }
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto' } = options;

  const transformations = [];
  if (width || height) {
    transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_limit`);
  }
  transformations.push(`q_${quality},f_${format}`);

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join('/')}/${publicId}`;
}
