import type { Gen, PropertyConfig, TestResult } from '../types/index.js';
import { createRandom } from '../generators/random.js';

const DEFAULT_CONFIG: Required<PropertyConfig> = {
  numRuns: 100,
  maxShrinks: 100,
  seed: Date.now(),
  timeout: 5000,
};

/**
 * Run a property test
 * @param generator - Generator for test inputs
 * @param property - Property function to test (should throw on failure)
 * @param config - Test configuration
 */
export async function forAll<T>(
  generator: Gen<T>,
  property: (value: T) => void | Promise<void>,
  config: PropertyConfig = {}
): Promise<TestResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const random = createRandom(cfg.seed);

  for (let i = 0; i < cfg.numRuns; i++) {
    const testRandom = random.clone();
    const value = generator.generate(testRandom);

    try {
      const result = property(value);
      if (result instanceof Promise) {
        await Promise.race([
          result,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Test timeout')), cfg.timeout)
          ),
        ]);
      }
    } catch (error) {
      // Test failed - return result with counterexample
      return {
        success: false,
        seed: cfg.seed,
        error: error instanceof Error ? error : new Error(String(error)),
        counterexample: value,
      };
    }
  }

  return { success: true };
}

/**
 * Create a property test that can be used with test runners
 */
export function property<T>(
  generator: Gen<T>,
  config?: PropertyConfig
): (property: (value: T) => void | Promise<void>) => Promise<void> {
  return async (propertyFn) => {
    const result = await forAll(generator, propertyFn, config);
    if (!result.success) {
      const error = result.error || new Error('Property test failed');
      if (result.counterexample !== undefined) {
        error.message += `\n\nCounterexample:\n${JSON.stringify(
          result.counterexample,
          null,
          2
        )}`;
      }
      if (result.seed !== undefined) {
        error.message += `\n\nReproduce with seed: ${result.seed}`;
      }
      throw error;
    }
  };
}
