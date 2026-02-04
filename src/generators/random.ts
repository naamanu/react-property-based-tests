import type { Random } from '../types/index.js';

/**
 * Simple LCG (Linear Congruential Generator) implementation
 * Uses the same constants as Java's java.util.Random
 */
export class LCGRandom implements Random {
  private state: number;

  constructor(public seed: number) {
    this.state = seed;
  }

  nextInt(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    const range = max - min;
    return min + (this.next() % range);
  }

  nextFloat(): number {
    return this.next() / 0x7fffffff;
  }

  nextBoolean(): boolean {
    return this.next() % 2 === 0;
  }

  clone(): Random {
    const cloned = new LCGRandom(this.seed);
    cloned.state = this.state;
    return cloned;
  }

  private next(): number {
    // LCG formula: X(n+1) = (a * X(n) + c) mod m
    // Using constants from java.util.Random
    const a = 0x5deece66d;
    const c = 0xb;
    const m = 0x1000000000000; // 2^48

    this.state = (a * this.state + c) % m;
    return Math.abs(this.state);
  }
}

/**
 * Create a new Random instance with optional seed
 * If no seed provided, uses current timestamp
 */
export function createRandom(seed?: number): Random {
  return new LCGRandom(seed ?? Date.now());
}
