import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface QuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  questionText: string;
  onImageClick?: () => void;
}

export function QuestionCard({ className, imageUrl, questionText, onImageClick, ...props }: QuestionCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden', className)} {...props}>
      {/* Image Section - 40% of screen height */}
      <div className="relative h-[40vh] bg-gray-100 cursor-pointer" onClick={onImageClick}>
        <img
          src={imageUrl}
          alt="Question"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Question Text - 20% of screen height */}
      <div className="h-[20vh] flex items-center justify-center p-4">
        <p className="text-center text-lg font-medium text-gray-900">{questionText}</p>
      </div>
    </div>
  );
}
