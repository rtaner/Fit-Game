import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AnswerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isSelected?: boolean;
}

export function AnswerButton({
  className,
  isCorrect,
  isIncorrect,
  isSelected,
  children,
  ...props
}: AnswerButtonProps) {
  return (
    <button
      className={cn(
        'w-full px-6 py-4 rounded-lg text-left font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        !isCorrect && !isIncorrect && 'bg-gray-100 hover:bg-gray-200 text-gray-900',
        isCorrect && 'bg-green-100 text-green-800 border-2 border-green-500',
        isIncorrect && 'bg-red-100 text-red-800 border-2 border-red-500',
        isSelected && !isCorrect && !isIncorrect && 'bg-primary/10 border-2 border-primary',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {isCorrect && (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {isIncorrect && (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="flex-1">{children}</span>
      </div>
    </button>
  );
}
