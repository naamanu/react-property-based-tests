/**
 * React Property Tests - Property-based testing framework for React
 * with focus on interaction sequences
 */

// Core types
export type { Gen, Random, PropertyConfig, TestResult } from './types/index.js';
export type {
  Command,
  CommandConfig,
  CommandSequenceResult,
} from './types/commands.js';

// Generators
export {
  createRandom,
  LCGRandom,
  gen,
  constant,
  oneOf,
  frequency,
} from './generators/index.js';

// Primitive generators
export {
  integer,
  nat,
  float,
  boolean,
  string,
  alphaNumeric,
  stringOf,
  ascii,
  hexString,
  nullValue,
  undefinedValue,
} from './generators/index.js';

// Collection generators
export {
  array,
  nonEmptyArray,
  arrayOfLength,
  tuple,
  object,
  partialObject,
  record,
  set,
  map,
} from './generators/index.js';

// Property testing
export { forAll, property } from './property/property.js';

// Command-based testing
export {
  commandSequence,
  runCommandSequence,
  forAllCommands,
  commandProperty,
} from './commands/index.js';

// React integration
export {
  createReactSystem,
  reactSystemFactory,
  type ReactSystem,
} from './integrations/react.js';

// Vitest integration
export { propTest, commandTest } from './integrations/vitest.js';
