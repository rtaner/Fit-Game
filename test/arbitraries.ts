import fc from 'fast-check';
import type { User, QuestionItem, GameSession } from '@/types/database.types';

/**
 * Arbitrary for valid store codes (1500-1900)
 */
export const storeCodeArbitrary = () => fc.integer({ min: 1500, max: 1900 });

/**
 * Arbitrary for invalid store codes (outside 1500-1900)
 */
export const invalidStoreCodeArbitrary = () =>
  fc.oneof(
    fc.integer({ max: 1499 }),
    fc.integer({ min: 1901 })
  );

/**
 * Arbitrary for usernames
 */
export const usernameArbitrary = () =>
  fc
    .string({ minLength: 3, maxLength: 50 })
    .filter((s) => /^[a-zA-Z0-9_]+$/.test(s));

/**
 * Arbitrary for user registration data
 */
export const registerDataArbitrary = () =>
  fc.record({
    firstName: fc.string({ minLength: 1, maxLength: 100 }),
    lastName: fc.string({ minLength: 1, maxLength: 100 }),
    username: usernameArbitrary(),
    password: fc.string({ minLength: 8, maxLength: 100 }),
    storeCode: storeCodeArbitrary(),
  });

/**
 * Arbitrary for question items
 */
export const questionItemArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    category_id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    image_url: fc.webUrl(),
    cloudinary_public_id: fc.option(fc.string(), { nil: null }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    explanation: fc.option(fc.string(), { nil: null }),
    tags: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
    is_active: fc.boolean(),
    created_at: fc.date().map((d) => d.toISOString()),
    updated_at: fc.date().map((d) => d.toISOString()),
  });

/**
 * Arbitrary for game sessions
 */
export const gameSessionArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    category_id: fc.uuid(),
    score: fc.integer({ min: 0, max: 100 }),
    total_questions: fc.integer({ min: 0, max: 100 }),
    lifeline_50_used: fc.boolean(),
    lifeline_skip_used: fc.boolean(),
    started_at: fc.date().map((d) => d.toISOString()),
    ended_at: fc.option(fc.date().map((d) => d.toISOString()), { nil: null }),
    duration_seconds: fc.option(fc.integer({ min: 0, max: 3600 }), { nil: null }),
    created_at: fc.date().map((d) => d.toISOString()),
  });

/**
 * Arbitrary for user objects
 */
export const userArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    username: usernameArbitrary(),
    first_name: fc.string({ minLength: 1, maxLength: 100 }),
    last_name: fc.string({ minLength: 1, maxLength: 100 }),
    store_code: storeCodeArbitrary(),
    role: fc.constantFrom('employee' as const, 'admin' as const),
    current_streak: fc.integer({ min: 0, max: 365 }),
    longest_streak: fc.integer({ min: 0, max: 365 }),
    last_login_date: fc.option(fc.string(), { nil: null }),
    created_at: fc.string(),
    updated_at: fc.string(),
  });
