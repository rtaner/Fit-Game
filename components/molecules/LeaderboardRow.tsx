import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';

export interface LeaderboardRowProps extends HTMLAttributes<HTMLDivElement> {
  rank: number;
  username: string;
  storeName: string;
  score: number;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({
  className,
  rank,
  username,
  storeName,
  score,
  isCurrentUser,
  ...props
}: LeaderboardRowProps) {
  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return 'warning';
    if (rank === 2) return 'info';
    if (rank === 3) return 'success';
    return 'default';
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg transition-colors',
        isCurrentUser ? 'bg-primary/10 border-2 border-primary' : 'bg-white hover:bg-gray-50',
        className
      )}
      {...props}
    >
      <Badge variant={getRankBadgeVariant(rank)} size="lg">
        #{rank}
      </Badge>

      <Avatar fallback={username} size="md" />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{username}</p>
        <p className="text-sm text-gray-500 truncate">{storeName}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-primary">{score}</p>
        <p className="text-xs text-gray-500">puan</p>
      </div>
    </div>
  );
}
