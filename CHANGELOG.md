# Changelog

All notable changes to the Mavi Fit Game project will be documented in this file.

## [1.0.9] - Terms & Conditions + Security - 2024-12-06

### Added
- 📜 **Terms & Conditions Modal**: Comprehensive usage terms and disclaimer
  - 6-section detailed terms document
  - Security warnings highlighted
  - Scrollable modal with fixed header/footer
  - Beautiful design with color-coded sections
- ☑️ **Terms Acceptance Checkbox**: Required on registration
  - Users must accept terms to register
  - "Read Terms" link opens modal
  - Form validation prevents registration without acceptance
- ⚠️ **Username Security Warning**: 
  - Warning message: "Don't use company employee ID"
  - Only letters and underscores allowed (no numbers)
  - Prevents accidental use of sensitive information

### Changed
- 🔒 **Username Validation**: Updated regex to block numbers
  - Old: `/^[a-zA-Z0-9_]+$/` (letters, numbers, underscore)
  - New: `/^[a-zA-Z_]+$/` (letters, underscore only)
- 📝 **Registration Schema**: Added `acceptTerms` field validation

### Security
- 🛡️ Prevents users from using employee IDs as usernames
- 🛡️ Clear warnings about not using company passwords
- 🛡️ Explicit disclaimer about app being unofficial

### Technical
- Version bumped to 1.0.9
- Created `TermsModal.tsx` component
- Updated registration form validation

## [1.0.8] - Update Notification System - 2024-12-06

### Added
- ✨ **Update Notification Component**: Toast notification for new updates
  - Shows when user opens app after update
  - Displays version number and new features
  - Auto-dismisses after 5 seconds
  - Manual close button
  - Beautiful gradient design (purple to blue)
- 🔔 **Version Tracking**: localStorage-based version tracking
- 📝 **Changelog Integration**: Update messages pulled from changelog

### Changed
- 🔄 **Automatic Version Management**: AI now handles version updates automatically
- 📝 **Updated PWA Guide**: Simplified deployment process documentation

### Technical
- Version bumped to 1.0.8
- Added UpdateNotification component to root layout
- Integrated with existing PWA update system

## [2.0.0] - UI Migration - 2024-12-03

### Added

#### Training System
- **Flashcard Training System**: Interactive swipe-based learning cards
- **Category Selection**: Choose from multiple quiz categories for focused learning
- **Swipe Gestures**: Natural left/right swipe navigation through training cards
- **Filter System**: Filter training content by gender and category
- **Progress Tracking**: Visual progress bar showing completion status
- **Completion Screen**: Celebration screen when finishing a category

#### Game Enhancements
- **Timer System**: 8-second countdown timer for each question
- **Freeze Joker**: New lifeline to pause the timer
- **Visual Timer**: Circular progress indicator in game header
- **Joker Modal**: Centralized modal for all lifeline options
- **Joker Tracking**: Track joker usage for badge calculations

#### UI/UX Improvements
- **Modern Design**: Clean, minimalist interface with Mavi brand colors
- **Bottom Navigation**: Persistent navigation bar across all pages
- **Smooth Animations**: Framer Motion animations throughout the app
- **Mobile-First**: Optimized for mobile devices with responsive design
- **Loading States**: Skeleton loaders and spinners for better UX
- **Empty States**: Helpful messages when no content is available

#### Dashboard
- **Redesigned Header**: User greeting with profile avatar
- **Streak Card**: Prominent display of daily and best streaks
- **Category Grid**: 3-column grid layout for quiz categories
- **Hover Effects**: Interactive animations on category cards

#### Profile Page
- **Header Card**: User info with avatar, name, store, and total points
- **Stats Grid**: 2x2 grid showing games played, correct answers, success rate, and ranking
- **Streak Section**: Weekly login visualization with checkmarks
- **Badge Preview**: First 6 badges with "View All" button

#### Leaderboard
- **Time Period Tabs**: Switch between Weekly, Monthly, and All-time
- **Ranking Types**: View by Stores, My Store, or Individual
- **Podium Display**: Special display for top 3 positions
- **User Highlighting**: Current user/store highlighted in list

#### Badges Page
- **Category Grouping**: Badges organized by category (Beginner, Skill, Streak, Leadership)
- **Progress Bars**: Visual progress for locked badges
- **Overall Progress**: Total badge completion percentage
- **Badge Details**: Name, description, and requirements for each badge

#### Authentication
- **Modern Forms**: Clean, card-based login and register forms
- **Password Toggle**: Show/hide password functionality
- **Store Dropdown**: Select store during registration
- **Form Validation**: Real-time validation with helpful error messages

### Changed
- **Color Scheme**: Updated to use Mavi brand colors (mavi-navy, mavi-light)
- **Border Radius**: Increased to 2xl and 3xl for modern look
- **Typography**: Improved font hierarchy and readability
- **Spacing**: Consistent padding and margins throughout
- **Scroll Behavior**: Game page is overflow-hidden, others scroll normally

### Technical
- **Tailwind Config**: Extended with Mavi brand colors and border radius
- **Framer Motion**: Added for smooth animations and transitions
- **Mobile Optimization**: All pages optimized for mobile-first approach
- **Viewport Meta**: Configured for proper mobile rendering
- **Component Structure**: Maintained Atomic Design pattern

### Maintained
- **Backend Integration**: All existing API calls and services preserved
- **Supabase Connection**: Database queries unchanged
- **Authentication Flow**: Login/register logic maintained
- **Game Logic**: Core game mechanics preserved
- **Badge System**: Badge calculation and awarding unchanged
- **Leaderboard Logic**: Ranking calculations maintained
- **State Management**: Zustand stores unchanged

## [2.1.0] - PWA Enhancement - 2024-12-04

### Added

#### Progressive Web App (PWA)
- **Service Worker**: Offline support with intelligent caching strategy
  - Static assets cached on install
  - API responses cached dynamically
  - Network-first for API calls, cache-first for static files
- **Install Prompt**: Custom install prompt component
  - Shows after 30 seconds of usage
  - Dismissible with 7-day cooldown
  - Modern UI with download icon
- **Offline Page**: Dedicated offline experience
  - Clear messaging when no internet connection
  - Retry button to reload
  - Helpful instructions
- **Manifest Configuration**: Complete PWA manifest
  - Standalone display mode
  - Portrait orientation
  - Mavi brand colors (theme: #002D66, background: #F8FAFC)
  - Icon definitions for all sizes
- **Apple Touch Icons**: iOS home screen support
- **Service Worker Registration**: Automatic registration on page load
- **Cache Management**: Automatic cleanup of old caches
- **Update Detection**: Notifies when new version is available

#### Technical
- **Next.js Headers**: Optimized caching for SW and manifest
- **PWA Utilities**: Helper functions for install detection
- **TypeScript Support**: Full type safety for PWA features
- **Mobile Optimization**: Enhanced mobile app-like experience

### Documentation
- **PWA Setup Guide**: Comprehensive setup and testing instructions
- **Icon Generation Guide**: Multiple methods for creating PWA icons
- **Troubleshooting**: Common issues and solutions
- **Testing Checklist**: Complete testing workflow

### Requirements
- Icon files need to be added to `public/icons/`:
  - icon-192x192.png (192x192 pixels)
  - icon-512x512.png (512x512 pixels)
  - apple-touch-icon.png (180x180 pixels) [Optional]
  - favicon.ico (32x32 pixels) [Optional]

## [1.0.0] - Initial Release

### Features
- User authentication system
- Quiz game with multiple categories
- Lifeline system (50-50, Skip)
- Badge system
- Leaderboard
- Admin panel
- Basic PWA support
