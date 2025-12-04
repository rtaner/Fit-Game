/**
 * Design System Constants for Mavi Fit Game
 * Quizai-inspired modern UI design
 */

// Color Palette
export const COLORS = {
  // Primary Colors
  navy: '#002B49',
  maviBlue: '#003399',
  lightBlue: '#00A3E0',
  cyan: '#00D4FF',

  // Neutral Colors
  background: '#F8FAFC',
  cardWhite: '#FFFFFF',
  textDark: '#1E293B',
  textGray: '#64748B',
  borderGray: '#E2E8F0',

  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    h1: 'clamp(2rem, 5vw, 3rem)',
    h2: 'clamp(1.5rem, 4vw, 2rem)',
    h3: 'clamp(1.25rem, 3vw, 1.5rem)',
    body: 'clamp(0.875rem, 2vw, 1rem)',
    small: 'clamp(0.75rem, 1.5vw, 0.875rem)',
  },
} as const;

// Spacing
export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
} as const;

// Border Radius
export const BORDER_RADIUS = {
  small: '0.5rem', // 8px - rounded-lg
  medium: '0.75rem', // 12px - rounded-xl
  large: '1rem', // 16px - rounded-2xl
  extraLarge: '1.5rem', // 24px - rounded-3xl
} as const;

// Shadows
export const SHADOWS = {
  soft: '0 2px 8px rgba(0,0,0,0.08)',
  medium: '0 4px 16px rgba(0,0,0,0.12)',
  large: '0 8px 24px rgba(0,0,0,0.16)',
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  modal: 20,
  toast: 30,
  tooltip: 40,
  bottomNav: 50,
} as const;

// Game Screen Layout (No-Scroll Policy)
export const GAME_LAYOUT = {
  progressBar: '5%',
  productImage: '45%',
  questionText: '20%',
  answerButtons: '30%',
} as const;

// Category Colors (for dashboard cards)
export const CATEGORY_COLORS = [
  'from-blue-500 to-blue-600',
  'from-cyan-500 to-cyan-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-sky-500 to-sky-600',
  'from-violet-500 to-violet-600',
] as const;
