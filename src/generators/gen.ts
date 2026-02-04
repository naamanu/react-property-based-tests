import type { Gen, Random } from '../types/index.js';

/**
 * Base implementation of the Gen interface
 */
export class Generator<T> implements Gen<T> {
  constructor(private readonly generatorFn: (random: Random) => T) {}

  generate(random: Random): T {
    return this.generatorFn(random);
  }

  map<U>(fn: (value: T) => U): Gen<U> {
    return new Generator((random) => fn(this.generate(random)));
  }

  flatMap<U>(fn: (value: T) => Gen<U>): Gen<U> {
    return new Generator((random) => {
      const value = this.generate(random);
      return fn(value).generate(random);
    });
  }

  filter(predicate: (value: T) => boolean, maxAttempts = 100): Gen<T> {
    return new Generator((random) => {
      for (let i = 0; i < maxAttempts; i++) {
        const value = this.generate(random.clone());
        if (predicate(value)) {
          return value;
        }
      }
      throw new Error(
        `Failed to generate value matching predicate after ${maxAttempts} attempts`
      );
    });
  }
}

/**
 * Create a generator from a function
 */
export function gen<T>(fn: (random: Random) => T): Gen<T> {
  return new Generator(fn);
}

/**
 * Create a generator that always returns the same value
 */
export function constant<T>(value: T): Gen<T> {
  return new Generator(() => value);
}

/**
 * Choose one generator from the provided list
 */
export function oneOf<T>(...generators: Gen<T>[]): Gen<T> {
  if (generators.length === 0) {
    throw new Error('oneOf requires at least one generator');
  }
  return new Generator((random) => {
    const index = random.nextInt(0, generators.length);
    return generators[index].generate(random);
  });
}

/**
 * Apply a frequency distribution to generators
 * @param weightedGens - Array of [weight, generator] tuples
 */
export function frequency<T>(...weightedGens: Array<[number, Gen<T>]>): Gen<T> {
  if (weightedGens.length === 0) {
    throw new Error('frequency requires at least one generator');
  }

  const totalWeight = weightedGens.reduce((sum, [weight]) => sum + weight, 0);

  return new Generator((random) => {
    let choice = random.nextFloat() * totalWeight;
    for (const [weight, generator] of weightedGens) {
      choice -= weight;
      if (choice <= 0) {
        return generator.generate(random);
      }
    }
    // Fallback (shouldn't reach here)
    return weightedGens[weightedGens.length - 1][1].generate(random);
  });
}
