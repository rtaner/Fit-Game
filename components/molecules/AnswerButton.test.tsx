import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnswerButton } from './AnswerButton';

describe('AnswerButton Component', () => {
  it('should render with children', () => {
    render(<AnswerButton>Answer A</AnswerButton>);
    expect(screen.getByRole('button', { name: /answer a/i })).toBeInTheDocument();
  });

  it('should show correct styling when isCorrect is true', () => {
    render(<AnswerButton isCorrect>Correct Answer</AnswerButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-100');
    expect(button).toHaveClass('border-green-500');
  });

  it('should show incorrect styling when isIncorrect is true', () => {
    render(<AnswerButton isIncorrect>Wrong Answer</AnswerButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-100');
    expect(button).toHaveClass('border-red-500');
  });

  it('should show selected styling when isSelected is true', () => {
    render(<AnswerButton isSelected>Selected Answer</AnswerButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-primary');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AnswerButton disabled>Disabled</AnswerButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
