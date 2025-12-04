import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LifelineButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  lifelineType: 'fifty-fifty' | 'skip';
  isUsed?: boolean;
}

export function LifelineButton({ className, lifelineType, isUsed, disabled, ...props }: LifelineButtonProps) {
  const icons = {
    'fifty-fifty': '50:50',
    skip: '⏭️',
  };

  const labels = {
    'fifty-fifty': '50-50',
    skip: 'Pas Geç',
  };

  return (
    <button
      type="button"
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isUsed || disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-primary-dark',
        className
      )}
      disabled={isUsed || disabled}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[lifelineType]}</span>
        <span className="text-sm">{labels[lifelineType]}</span>
      </div>
    </button>
  );
}
