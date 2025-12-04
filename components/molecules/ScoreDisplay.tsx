import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ScoreDisplayProps extends HTMLAttributes<HTMLDivElement> {
  score: number;
  label?: string;
}

export function ScoreDisplay({ className, score, label = 'Skor', ...props }: ScoreDisplayProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow', className)} {...props}>
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-xl font-bold text-primary">{score}</span>
    </div>
  );
}
