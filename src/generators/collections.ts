import type { Gen } from '../types/index.js';
import { gen } from './gen.js';

/**
 * Generate arrays of values from a generator
 */
export function array<T>(
  elementGen: Gen<T>,
  minLength = 0,
  maxLength = 10
): Gen<T[]> {
  return gen((random) => {
    const length = random.nextInt(minLength, maxLength + 1);
    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      result.push(elementGen.generate(random));
    }
    return result;
  });
}

/**
 * Generate non-empty arrays
 */
export function nonEmptyArray<T>(elementGen: Gen<T>, maxLength = 10): Gen<T[]> {
  return array(elementGen, 1, maxLength);
}

/**
 * Generate arrays of a specific length
 */
export function arrayOfLength<T>(elementGen: Gen<T>, length: number): Gen<T[]> {
  return array(elementGen, length, length);
}

/**
 * Generate tuples (fixed-length arrays with heterogeneous types)
 */
export function tuple<T extends readonly unknown[]>(
  ...generators: { [K in keyof T]: Gen<T[K]> }
): Gen<T> {
  return gen((random) => {
    return generators.map((g) => g.generate(random)) as unknown as T;
  });
}

/**
 * Generate objects with specified property generators
 */
export function object<T extends Record<string, unknown>>(spec: {
  [K in keyof T]: Gen<T[K]>;
}): Gen<T> {
  return gen((random) => {
    const result = {} as T;
    for (const key in spec) {
      if (Object.prototype.hasOwnProperty.call(spec, key)) {
        result[key] = spec[key].generate(random);
      }
    }
    return result;
  });
}

/**
 * Generate objects with optional properties
 */
export function partialObject<T extends Record<string, unknown>>(spec: {
  [K in keyof T]: Gen<T[K]>;
}): Gen<Partial<T>> {
  return gen((random) => {
    const result: Partial<T> = {};
    for (const key in spec) {
      if (Object.prototype.hasOwnProperty.call(spec, key)) {
        // 50% chance to include each property
        if (random.nextBoolean()) {
          result[key] = spec[key].generate(random);
        }
      }
    }
    return result;
  });
}

/**
 * Generate records (objects with uniform value types)
 */
export function record<T>(
  keyGen: Gen<string>,
  valueGen: Gen<T>,
  minKeys = 0,
  maxKeys = 10
): Gen<Record<string, T>> {
  return gen((random) => {
    const numKeys = random.nextInt(minKeys, maxKeys + 1);
    const result: Record<string, T> = {};
    const keys = new Set<string>();

    // Generate unique keys
    let attempts = 0;
    while (keys.size < numKeys && attempts < numKeys * 10) {
      keys.add(keyGen.generate(random));
      attempts++;
    }

    // Generate values for each key
    for (const key of keys) {
      result[key] = valueGen.generate(random);
    }

    return result;
  });
}

/**
 * Generate Sets
 */
export function set<T>(
  elementGen: Gen<T>,
  minSize = 0,
  maxSize = 10
): Gen<Set<T>> {
  return array(elementGen, minSize, maxSize * 2).map((arr) => new Set(arr));
}

/**
 * Generate Maps
 */
export function map<K, V>(
  keyGen: Gen<K>,
  valueGen: Gen<V>,
  minSize = 0,
  maxSize = 10
): Gen<Map<K, V>> {
  return gen((random) => {
    const result = new Map<K, V>();
    const targetSize = random.nextInt(minSize, maxSize + 1);
    let attempts = 0;

    while (result.size < targetSize && attempts < targetSize * 10) {
      const key = keyGen.generate(random);
      const value = valueGen.generate(random);
      result.set(key, value);
      attempts++;
    }

    return result;
  });
}
