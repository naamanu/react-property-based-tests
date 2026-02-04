import type { Gen } from '../types/index.js';
import { gen } from './gen.js';

/**
 * Generate random integers in range [min, max)
 */
export function integer(min = -1000, max = 1000): Gen<number> {
  return gen((random) => random.nextInt(min, max));
}

/**
 * Generate random positive integers
 */
export function nat(max = 1000): Gen<number> {
  return integer(0, max);
}

/**
 * Generate random floats
 */
export function float(min = -1000, max = 1000): Gen<number> {
  return gen((random) => min + random.nextFloat() * (max - min));
}

/**
 * Generate random booleans
 */
export function boolean(): Gen<boolean> {
  return gen((random) => random.nextBoolean());
}

/**
 * Generate random strings of given length range
 */
export function string(minLength = 0, maxLength = 20): Gen<string> {
  return gen((random) => {
    const length = random.nextInt(minLength, maxLength + 1);
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[random.nextInt(0, chars.length)];
    }
    return result;
  });
}

/**
 * Generate alphanumeric strings
 */
export function alphaNumeric(minLength = 0, maxLength = 20): Gen<string> {
  return string(minLength, maxLength);
}

/**
 * Generate strings from a specific character set
 */
export function stringOf(
  charset: string,
  minLength = 0,
  maxLength = 20
): Gen<string> {
  if (charset.length === 0) {
    throw new Error('charset must not be empty');
  }
  return gen((random) => {
    const length = random.nextInt(minLength, maxLength + 1);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[random.nextInt(0, charset.length)];
    }
    return result;
  });
}

/**
 * Generate ASCII strings
 */
export function ascii(minLength = 0, maxLength = 20): Gen<string> {
  return gen((random) => {
    const length = random.nextInt(minLength, maxLength + 1);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(random.nextInt(32, 127)); // Printable ASCII
    }
    return result;
  });
}

/**
 * Generate hexadecimal strings
 */
export function hexString(minLength = 0, maxLength = 20): Gen<string> {
  return stringOf('0123456789abcdef', minLength, maxLength);
}

/**
 * Generate null values
 */
export function nullValue(): Gen<null> {
  return gen(() => null);
}

/**
 * Generate undefined values
 */
export function undefinedValue(): Gen<undefined> {
  return gen(() => undefined);
}
