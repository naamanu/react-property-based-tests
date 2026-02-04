/**
 * Command-based property testing example for React Counter component
 */

import { describe } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { commandTest } from '../src/integrations/vitest.js';
import { reactSystemFactory } from '../src/integrations/react.js';
import { oneOf, constant } from '../src/generators/index.js';
import type { Command } from '../src/types/commands.js';
import type { ReactSystem } from '../src/integrations/react.js';
import { Counter } from './Counter.js';

/**
 * Model representing the counter's state
 */
interface CounterModel {
  count: number;
  initialValue: number;
  min?: number;
  max?: number;
}

/**
 * Increment command
 */
class IncrementCommand implements Command<CounterModel, ReactSystem> {
  check(model: CounterModel): boolean {
    return model.max === undefined || model.count < model.max;
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      '[data-testid="increment"]'
    ) as HTMLButtonElement;
    fireEvent.click(button);
  }

  nextState(model: CounterModel): CounterModel {
    const newCount = model.count + 1;
    return {
      ...model,
      count:
        model.max !== undefined && newCount > model.max ? model.count : newCount,
    };
  }

  verify(model: CounterModel, system: ReactSystem): boolean {
    const display = system.container.querySelector('[data-testid="count"]');
    const displayedCount = parseInt(display?.textContent || '0', 10);
    return displayedCount === model.count;
  }

  toString(): string {
    return 'Increment';
  }
}

/**
 * Decrement command
 */
class DecrementCommand implements Command<CounterModel, ReactSystem> {
  check(model: CounterModel): boolean {
    return model.min === undefined || model.count > model.min;
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      '[data-testid="decrement"]'
    ) as HTMLButtonElement;
    fireEvent.click(button);
  }

  nextState(model: CounterModel): CounterModel {
    const newCount = model.count - 1;
    return {
      ...model,
      count:
        model.min !== undefined && newCount < model.min ? model.count : newCount,
    };
  }

  verify(model: CounterModel, system: ReactSystem): boolean {
    const display = system.container.querySelector('[data-testid="count"]');
    const displayedCount = parseInt(display?.textContent || '0', 10);
    return displayedCount === model.count;
  }

  toString(): string {
    return 'Decrement';
  }
}

/**
 * Reset command
 */
class ResetCommand implements Command<CounterModel, ReactSystem> {
  check(): boolean {
    return true;
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      '[data-testid="reset"]'
    ) as HTMLButtonElement;
    fireEvent.click(button);
  }

  nextState(model: CounterModel): CounterModel {
    return {
      ...model,
      count: model.initialValue,
    };
  }

  verify(model: CounterModel, system: ReactSystem): boolean {
    const display = system.container.querySelector('[data-testid="count"]');
    const displayedCount = parseInt(display?.textContent || '0', 10);
    return displayedCount === model.count;
  }

  toString(): string {
    return 'Reset';
  }
}

describe('Counter Component - Command-based Tests', () => {
  commandTest(
    'counter maintains correct state through arbitrary interaction sequences',
    // Initial model
    { count: 0, initialValue: 0 },
    // System factory
    reactSystemFactory(() => <Counter initialValue={0} />),
    // Available commands
    [
      constant(new IncrementCommand()),
      constant(new DecrementCommand()),
      constant(new ResetCommand()),
    ],
    // Config
    { numRuns: 50, maxCommands: 30 }
  );

  commandTest(
    'counter respects min/max bounds through arbitrary sequences',
    // Initial model
    { count: 5, initialValue: 5, min: 0, max: 10 },
    // System factory
    reactSystemFactory(() => <Counter initialValue={5} min={0} max={10} />),
    // Available commands
    [
      constant(new IncrementCommand()),
      constant(new DecrementCommand()),
      constant(new ResetCommand()),
    ],
    // Config
    { numRuns: 50, maxCommands: 50 }
  );
});
