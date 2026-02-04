/**
 * Basic property-based testing examples
 */

import { describe, expect } from 'vitest';
import { propTest } from '../src/integrations/vitest.js';
import {
  integer,
  string,
  array,
  object,
  boolean,
} from '../src/generators/index.js';

describe('Basic Property Tests', () => {
  propTest(
    'reversing an array twice gives original',
    array(integer()),
    (arr) => {
      const reversed = arr.slice().reverse().reverse();
      expect(reversed).toEqual(arr);
    }
  );

  propTest(
    'string length is always non-negative',
    string(0, 100),
    (str) => {
      expect(str.length).toBeGreaterThanOrEqual(0);
    }
  );

  propTest(
    'adding zero to a number returns the same number',
    integer(-1000, 1000),
    (n) => {
      expect(n + 0).toBe(n);
    }
  );

  propTest(
    'array concatenation is associative',
    array(integer(), 0, 5),
    (arr) => {
      const a = arr.slice(0, Math.floor(arr.length / 3));
      const b = arr.slice(
        Math.floor(arr.length / 3),
        Math.floor((2 * arr.length) / 3)
      );
      const c = arr.slice(Math.floor((2 * arr.length) / 3));

      const left = a.concat(b).concat(c);
      const right = a.concat(b.concat(c));

      expect(left).toEqual(right);
    }
  );

  propTest(
    'JSON round-trip preserves object structure',
    object({
      name: string(1, 20),
      age: integer(0, 120),
      active: boolean(),
    }),
    (obj) => {
      const json = JSON.stringify(obj);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(obj);
    },
    { numRuns: 50 }
  );
});
