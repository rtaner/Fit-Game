/**
 * BadgeAvatar Component
 * Displays badge image in a circular avatar
 * Used across profile, leaderboard, and other pages
 */

interface BadgeAvatarProps {
  badge?: {
    name: string;
    image_url?: string | null;
  } | null;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export function BadgeAvatar({ badge, fallback, size = 'md', className = '' }: BadgeAvatarProps) {
  const sizeClass = sizeClasses[size];
  
  // If badge has image
  if (badge?.image_url) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={badge.image_url}
          alt={badge.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Badge image failed to load:', badge.image_url);
            // Hide the image on error
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  // If badge exists but no image, show placeholder
  if (badge) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg ${className}`}>
        <span className="text-white font-bold">
          {badge.name.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  
  // Fallback (initials or default)
  return (
    <div className={`${sizeClass} rounded-full bg-mavi-navy flex items-center justify-center shadow-lg shadow-mavi-navy/20 ${className}`}>
      <span className="text-white font-bold">
        {fallback || '?'}
      </span>
    </div>
  );
}
