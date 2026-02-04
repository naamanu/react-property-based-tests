/**
 * Vitest integration for property-based testing
 */

import { test as vitestTest } from 'vitest';
import type { Gen, PropertyConfig } from '../types/index.js';
import { property } from '../property/property.js';
import type { CommandConfig } from '../types/commands.js';
import { commandProperty } from '../commands/commands.js';
import type { Command } from '../types/commands.js';

/**
 * Create a property-based test case for Vitest
 */
export function propTest<T>(
  name: string,
  generator: Gen<T>,
  testFn: (value: T) => void | Promise<void>,
  config?: PropertyConfig
): void {
  vitestTest(name, async () => {
    await property(generator, config)(testFn);
  });
}

/**
 * Create a command-based property test for Vitest
 */
export function commandTest<Model, System>(
  name: string,
  initialModel: Model,
  createSystem: () => System | Promise<System>,
  commands: Gen<Command<Model, System>>[],
  config?: CommandConfig
): void {
  vitestTest(name, commandProperty(initialModel, createSystem, commands, config));
}

/**
 * Create a focused property test (vitest's test.only)
 */
propTest.only = function <T>(
  name: string,
  generator: Gen<T>,
  testFn: (value: T) => void | Promise<void>,
  config?: PropertyConfig
): void {
  vitestTest.only(name, async () => {
    await property(generator, config)(testFn);
  });
};

/**
 * Create a skipped property test (vitest's test.skip)
 */
propTest.skip = function <T>(
  name: string,
  generator: Gen<T>,
  testFn: (value: T) => void | Promise<void>,
  config?: PropertyConfig
): void {
  vitestTest.skip(name, async () => {
    await property(generator, config)(testFn);
  });
};

/**
 * Create a focused command test
 */
commandTest.only = function <Model, System>(
  name: string,
  initialModel: Model,
  createSystem: () => System | Promise<System>,
  commands: Gen<Command<Model, System>>[],
  config?: CommandConfig
): void {
  vitestTest.only(name, commandProperty(initialModel, createSystem, commands, config));
};

/**
 * Create a skipped command test
 */
commandTest.skip = function <Model, System>(
  name: string,
  initialModel: Model,
  createSystem: () => System | Promise<System>,
  commands: Gen<Command<Model, System>>[],
  config?: CommandConfig
): void {
  vitestTest.skip(name, commandProperty(initialModel, createSystem, commands, config));
};
