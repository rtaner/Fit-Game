import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateStoreCode, storeCodeSchema, registerSchema } from './validators';
import { storeCodeArbitrary, invalidStoreCodeArbitrary, registerDataArbitrary } from '@/test/arbitraries';

describe('Store Code Validation', () => {
  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should validate store codes between 1500-1900 as true', () => {
    fc.assert(
      fc.property(storeCodeArbitrary(), (storeCode) => {
        expect(validateStoreCode(storeCode)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should validate store codes outside 1500-1900 as false', () => {
    fc.assert(
      fc.property(invalidStoreCodeArbitrary(), (storeCode) => {
        expect(validateStoreCode(storeCode)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should validate boundary values correctly', () => {
    // Lower boundary
    expect(validateStoreCode(1499)).toBe(false);
    expect(validateStoreCode(1500)).toBe(true);
    
    // Upper boundary
    expect(validateStoreCode(1900)).toBe(true);
    expect(validateStoreCode(1901)).toBe(false);
  });

  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should reject non-integer values', () => {
    expect(validateStoreCode(1500.5)).toBe(false);
    expect(validateStoreCode(1750.1)).toBe(false);
  });

  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should validate with Zod schema', () => {
    fc.assert(
      fc.property(storeCodeArbitrary(), (storeCode) => {
        const result = storeCodeSchema.safeParse(storeCode);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: mavi-fit-game, Property 1: Store Code Validation
  it('should reject invalid codes with Zod schema', () => {
    fc.assert(
      fc.property(invalidStoreCodeArbitrary(), (storeCode) => {
        const result = storeCodeSchema.safeParse(storeCode);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe('User Registration Validation', () => {
  // Feature: mavi-fit-game, Property 2: User Registration Creates Valid Account
  it('should validate all valid registration data', () => {
    fc.assert(
      fc.property(registerDataArbitrary(), (data) => {
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBe(data.firstName);
          expect(result.data.lastName).toBe(data.lastName);
          expect(result.data.username).toBe(data.username);
          expect(result.data.password).toBe(data.password);
          expect(result.data.storeCode).toBe(data.storeCode);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: mavi-fit-game, Property 3: Store Association Persistence
  it('should preserve store code in registration data', () => {
    fc.assert(
      fc.property(registerDataArbitrary(), (data) => {
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          // Store code should be preserved exactly
          expect(result.data.storeCode).toBe(data.storeCode);
          // Store code should be valid
          expect(validateStoreCode(result.data.storeCode)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should reject registration with invalid store code', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 100 }),
          lastName: fc.string({ minLength: 1, maxLength: 100 }),
          username: fc.string({ minLength: 3, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          storeCode: invalidStoreCodeArbitrary(),
        }),
        (data) => {
          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with short username', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 100 }),
          lastName: fc.string({ minLength: 1, maxLength: 100 }),
          username: fc.string({ minLength: 0, maxLength: 2 }),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          storeCode: storeCodeArbitrary(),
        }),
        (data) => {
          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject registration with short password', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 100 }),
          lastName: fc.string({ minLength: 1, maxLength: 100 }),
          username: fc.string({ minLength: 3, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
          password: fc.string({ minLength: 0, maxLength: 7 }),
          storeCode: storeCodeArbitrary(),
        }),
        (data) => {
          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
