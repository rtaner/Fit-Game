import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  try {
    let uploadData: string;

    if (typeof file === 'string') {
      uploadData = file;
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    // Eğer custom filename verilmişse kullan
    if (customFilename) {
      uploadOptions.public_id = customFilename;
      uploadOptions.use_filename = false;
      uploadOptions.unique_filename = false;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
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
