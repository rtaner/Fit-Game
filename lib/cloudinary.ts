/**
 * Cloudinary image transformation helper
 * Automatically scales and optimizes images based on usage
 */

export function getCloudinaryUrl(
  url: string | null,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'png' | 'jpg';
  } = {}
): string | null {
  if (!url) return null;
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) return url;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
  } = options;

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  // Add default optimizations
  transformations.push('c_fill'); // Crop to fill
  transformations.push('g_center'); // Center gravity
  
  const transformString = transformations.join(',');
  
  // Insert transformation into URL
  // Example: https://res.cloudinary.com/xxx/image/upload/v123/badges/image.png
  // Becomes: https://res.cloudinary.com/xxx/image/upload/w_200,h_200,q_auto,f_auto,c_fill,g_center/v123/badges/image.png
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
}

/**
 * Preset sizes for different use cases
 */
export const BadgeImageSizes = {
  // Small - List view, grid
  small: { width: 64, height: 64 },
  
  // Medium - Card view
  medium: { width: 128, height: 128 },
  
  // Large - Detail view, modal
  large: { width: 256, height: 256 },
  
  // XLarge - Full screen
  xlarge: { width: 512, height: 512 },
} as const;

/**
 * Get badge image URL with automatic sizing
 */
export function getBadgeImageUrl(
  url: string | null,
  size: keyof typeof BadgeImageSizes = 'medium'
): string | null {
  const dimensions = BadgeImageSizes[size];
  return getCloudinaryUrl(url, {
    ...dimensions,
    quality: 'auto',
    format: 'auto',
  });
}
