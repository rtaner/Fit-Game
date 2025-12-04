# Mavi Fit Game

Gamified quiz application for retail employees to learn product fits.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Image CDN**: Cloudinary
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + fast-check + Playwright
- **PWA**: Service Worker + Manifest
- **Analytics**: Vercel Analytics + Speed Insights
- **Monitoring**: Custom error tracking + performance monitoring

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the database migrations (see `database/migrations/`)
   - Copy your project URL and keys to `.env.local`

5. Set up Cloudinary:
   - Create a Cloudinary account
   - Copy your cloud name, API key, and secret to `.env.local`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run unit and property-based tests:

```bash
npm test
```

Run E2E tests:

```bash
npm run e2e
```

### Building

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components (Atomic Design)
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Simple component combinations
│   ├── organisms/         # Complex components
│   └── templates/         # Page templates
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── cloudinary/       # Cloudinary integration
│   └── utils/            # Helper functions
├── services/              # Business logic services
├── stores/                # Zustand state stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── constants/             # App constants
├── e2e/                   # E2E tests
└── public/                # Static assets
```

## Features

### Core Features
- ✅ User authentication (username/password)
- ✅ Quiz categories management
- ✅ Dynamic question generation
- ✅ Lifeline system (50-50, Skip, Freeze Timer)
- ✅ Real-time leaderboards (Weekly, Monthly, All-time)
- ✅ Badge system with progress tracking
- ✅ Streak tracking with visual feedback
- ✅ Deep analytics
- ✅ Admin panel
- ✅ PWA support

### UI/UX Features (New)
- ✅ Modern, clean interface with Mavi brand colors
- ✅ Mobile-first responsive design
- ✅ Smooth animations with Framer Motion
- ✅ Interactive flashcard training system
- ✅ Swipe gestures for training cards
- ✅ Category-based content filtering
- ✅ Timer system with countdown visualization
- ✅ Joker/Lifeline modal system
- ✅ Bottom navigation with active state
- ✅ Profile page with detailed statistics
- ✅ Leaderboard with podium display
- ✅ Badge celebration animations

## Monitoring & Analytics

The application includes comprehensive monitoring and analytics:

### Vercel Analytics
- Automatic page view tracking
- User interaction metrics
- Conversion tracking

### Vercel Speed Insights
- Core Web Vitals monitoring
- Performance metrics (FCP, LCP, CLS, FID, TTFB)
- Real user monitoring (RUM)

### Error Tracking
- Global error boundary for React errors
- Unhandled error and promise rejection tracking
- Error context with user and page information
- Development vs production error logging

### Custom Event Tracking
Use the monitoring utilities in `lib/monitoring.ts`:

```typescript
import { trackEvent, trackGameEvent, trackBadgeEvent, logError } from '@/lib/monitoring';

// Track custom events
trackEvent('button_click', { buttonName: 'start_game' });

// Track game events
trackGameEvent('game_start', { categoryId: 'abc123' });

// Track badge events
trackBadgeEvent('badge_earned', 'FIRST_GAME', { userId: 'user123' });

// Log errors with context
try {
  // ... code
} catch (error) {
  logError(error, { 
    userId: user.id, 
    page: '/dashboard',
    action: 'fetch_categories' 
  });
}
```

### Performance Monitoring
The app automatically tracks:
- Page load times
- DOM content loaded
- Time to interactive
- Custom performance metrics

## License

ISC
