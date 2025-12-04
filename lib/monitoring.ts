/**
 * Monitoring and Analytics Utilities
 * 
 * This module provides utilities for tracking errors, performance metrics,
 * and user analytics in the Mavi Fit Game application.
 */

interface ErrorContext {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Log an error to the monitoring service
 * In production, this would send to Sentry or similar service
 */
export function logError(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  } else {
    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: context });
    
    // For now, just log to console
    console.error('Production error:', error.message, context);
  }
}

/**
 * Track a custom event
 * In production, this would send to analytics service
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Event tracked:', eventName, properties);
  } else {
    // In production, send to analytics service
    // Example: analytics.track(eventName, properties);
    
    // Vercel Analytics will automatically track page views
    // Custom events can be added here if needed
  }
}

/**
 * Track a performance metric
 */
export function trackPerformance(metric: PerformanceMetric): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance metric:', metric);
  } else {
    // In production, send to performance monitoring service
    // Vercel Speed Insights will automatically track Core Web Vitals
  }
}

/**
 * Track user action for analytics
 */
export function trackUserAction(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  trackEvent('user_action', {
    action,
    category,
    label,
    value,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track game events
 */
export function trackGameEvent(
  eventType: 'game_start' | 'game_end' | 'answer_submitted' | 'joker_used',
  data: Record<string, any>
): void {
  trackEvent(`game_${eventType}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track badge events
 */
export function trackBadgeEvent(
  eventType: 'badge_earned' | 'badge_viewed' | 'badge_activated',
  badgeCode: string,
  metadata?: Record<string, any>
): void {
  trackEvent(`badge_${eventType}`, {
    badgeCode,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Initialize monitoring
 * Call this in the root layout or _app
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track page load performance
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          trackPerformance({
            name: 'page_load',
            value: navigation.loadEventEnd - navigation.fetchStart,
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              domInteractive: navigation.domInteractive - navigation.fetchStart,
            },
          });
        }
      }, 0);
    });
  }

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    logError(new Error(event.message), {
      page: window.location.pathname,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        page: window.location.pathname,
        action: 'unhandled_promise_rejection',
      }
    );
  });
}
