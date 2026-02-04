/**
 * Core types for the property-based testing framework
 */

/**
 * Random number generator with seed support for reproducibility
 */
export interface Random {
  /** Current seed value */
  seed: number;
  /** Generate random integer in range [min, max) */
  nextInt(min: number, max: number): number;
  /** Generate random float in range [0, 1) */
  nextFloat(): number;
  /** Generate random boolean */
  nextBoolean(): boolean;
  /** Clone the random state for independent generation */
  clone(): Random;
}

/**
 * Generator that produces random values of type T
 */
export interface Gen<T> {
  /** Generate a value using the provided random source */
  generate(random: Random): T;
  /** Map this generator to produce a different type */
  map<U>(fn: (value: T) => U): Gen<U>;
  /** FlatMap for composing generators */
  flatMap<U>(fn: (value: T) => Gen<U>): Gen<U>;
  /** Filter generated values */
  filter(predicate: (value: T) => boolean): Gen<T>;
}

/**
 * Test result for a single run
 */
export interface TestResult {
  success: boolean;
  seed?: number;
  error?: Error;
  shrunk?: unknown;
  counterexample?: unknown;
}

/**
 * Configuration for property tests
 */
export interface PropertyConfig {
  /** Number of test cases to run */
  numRuns?: number;
  /** Maximum shrink attempts when a test fails */
  maxShrinks?: number;
  /** Seed for reproducible tests */
  seed?: number;
  /** Timeout per test run in ms */
  timeout?: number;
}
