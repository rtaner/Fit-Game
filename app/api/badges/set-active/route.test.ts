import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Valid badge codes based on system design
const validBadgeCodes = [
  'education_lover',
  'streak_10',
  'night_owl',
  'speed_demon',
  'category_expert',
  'perfect_score',
  'first_win',
  'store_champion'
];

// Mock data generators
const badgeProgressArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    badge_code: fc.constantFrom(...validBadgeCodes),
    current_value: fc.integer({ min: 0, max: 10000 }),
    tier_unlocked: fc.constantFrom('bronze', 'silver', 'gold', 'unlocked'),
    unlocked_at: fc.constant(new Date().toISOString()),
    metadata: fc.constant({}),
    created_at: fc.constant(new Date('2020-01-01').toISOString()),
    updated_at: fc.constant(new Date('2020-01-01').toISOString()),
  });

const unlockedBadgeArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    badge_code: fc.constantFrom(...validBadgeCodes),
    current_value: fc.integer({ min: 0, max: 10000 }),
    tier_unlocked: fc.constantFrom('bronze', 'silver', 'gold', 'unlocked'),
    unlocked_at: fc.constant(new Date().toISOString()),
    metadata: fc.constant({}),
    created_at: fc.constant(new Date('2020-01-01').toISOString()),
    updated_at: fc.constant(new Date('2020-01-01').toISOString()),
  });

const lockedBadgeArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    badge_code: fc.constantFrom(...validBadgeCodes),
    current_value: fc.integer({ min: 0, max: 10000 }),
    tier_unlocked: fc.constant(null),
    unlocked_at: fc.constant(null),
    metadata: fc.constant({}),
    created_at: fc.constant(new Date('2020-01-01').toISOString()),
    updated_at: fc.constant(new Date('2020-01-01').toISOString()),
  });

describe('Set Active Badge API - Property Tests', () => {
  // Feature: active-badge-selection, Property 1: Only earned badges can be set as active
  // Validates: Requirements 5.1
  describe('Property 1: Only earned badges can be set as active', () => {
    it('should succeed when user owns and has unlocked the badge', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          unlockedBadgeArbitrary(), // badge owned by user
          async (userId, badge) => {
            // Arrange: Mock Supabase auth and service clients
            const mockAuthClient = {
              auth: {
                getUser: vi.fn().mockResolvedValue({
                  data: { user: { id: userId } },
                  error: null,
                }),
              },
            };

            const mockServiceClient = {
              from: vi.fn((table: string) => {
                if (table === 'user_badge_progress') {
                  return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                      data: { ...badge, user_id: userId },
                      error: null,
                    }),
                  };
                }
                if (table === 'users') {
                  return {
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ error: null }),
                  };
                }
                return {};
              }),
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue(mockAuthClient as any);

            // Mock the service role client (imported from @supabase/supabase-js)
            const supabaseModule = await import('@supabase/supabase-js');
            vi.spyOn(supabaseModule, 'createClient').mockReturnValue(mockServiceClient as any);

            // Act: Call the API with the badge ID
            const request = new NextRequest('http://localhost:3000/api/badges/set-active', {
              method: 'POST',
              body: JSON.stringify({ badgeId: badge.id }),
            });

            const response = await POST(request);
            const data = await response.json();

            // Assert: Should succeed
            expect(response.status).toBe(200);
            expect(data.data.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail when user does not own the badge', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          fc.uuid(), // different user's badge ID
          async (userId, otherBadgeId) => {
            // Arrange: Mock Supabase auth and service clients
            const mockAuthClient = {
              auth: {
                getUser: vi.fn().mockResolvedValue({
                  data: { user: { id: userId } },
                  error: null,
                }),
              },
            };

            const mockServiceClient = {
              from: vi.fn((table: string) => {
                if (table === 'user_badge_progress') {
                  return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                      data: null,
                      error: { code: 'PGRST116', message: 'Not found' },
                    }),
                  };
                }
                return {};
              }),
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue(mockAuthClient as any);

            // Mock the service role client
            const supabaseModule = await import('@supabase/supabase-js');
            vi.spyOn(supabaseModule, 'createClient').mockReturnValue(mockServiceClient as any);

            // Act: Call the API with a badge the user doesn't own
            const request = new NextRequest('http://localhost:3000/api/badges/set-active', {
              method: 'POST',
              body: JSON.stringify({ badgeId: otherBadgeId }),
            });

            const response = await POST(request);
            const data = await response.json();

            // Assert: Should fail with 404
            expect(response.status).toBe(404);
            expect(data.error.code).toBe('BADGE_NOT_FOUND');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail when badge is not unlocked yet', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          lockedBadgeArbitrary(), // badge not yet unlocked
          async (userId, badge) => {
            // Arrange: Mock Supabase auth and service clients
            const mockAuthClient = {
              auth: {
                getUser: vi.fn().mockResolvedValue({
                  data: { user: { id: userId } },
                  error: null,
                }),
              },
            };

            const mockServiceClient = {
              from: vi.fn((table: string) => {
                if (table === 'user_badge_progress') {
                  return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                      data: { ...badge, user_id: userId },
                      error: null,
                    }),
                  };
                }
                return {};
              }),
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue(mockAuthClient as any);

            // Mock the service role client
            const supabaseModule = await import('@supabase/supabase-js');
            vi.spyOn(supabaseModule, 'createClient').mockReturnValue(mockServiceClient as any);

            // Act: Call the API with a locked badge
            const request = new NextRequest('http://localhost:3000/api/badges/set-active', {
              method: 'POST',
              body: JSON.stringify({ badgeId: badge.id }),
            });

            const response = await POST(request);
            const data = await response.json();

            // Assert: Should fail with 403
            expect(response.status).toBe(403);
            expect(data.error.code).toBe('BADGE_NOT_UNLOCKED');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
