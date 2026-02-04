# React Property Tests

A property-based testing framework for React with a focus on **interaction sequences** (model-based testing). Test that your React components maintain invariants through arbitrary sequences of user interactions.

## Features

- 🎲 **Property-based testing**: Test components with randomly generated inputs
- 🎮 **Command-based testing**: Verify components maintain invariants through interaction sequences
- ⚛️ **React integration**: First-class support for testing React components
- ⚡ **Vitest integration**: Seamless integration with Vitest test runner
- 🔧 **Composable generators**: Build complex generators from simple primitives
- 🎯 **TypeScript-first**: Full type safety throughout

## Installation

```bash
npm install react-property-tests
```

## Quick Start

### Basic Property Testing

Test simple properties of your functions:

```typescript
import { propTest, integer, array } from 'react-property-tests';

propTest(
  'reversing an array twice gives original',
  array(integer()),
  (arr) => {
    const reversed = arr.slice().reverse().reverse();
    expect(reversed).toEqual(arr);
  }
);
```

### Command-based Testing for React Components

Test that your components maintain invariants through sequences of user interactions:

```typescript
import { commandTest, constant } from 'react-property-tests';
import { reactSystemFactory } from 'react-property-tests';
import { Counter } from './Counter';

// Define your model
interface CounterModel {
  count: number;
  initialValue: number;
}

// Define commands (user actions)
class IncrementCommand implements Command<CounterModel, ReactSystem> {
  check(model: CounterModel): boolean {
    return true; // Always applicable
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector('[data-testid="increment"]');
    fireEvent.click(button);
  }

  nextState(model: CounterModel): CounterModel {
    return { ...model, count: model.count + 1 };
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

// Test with arbitrary command sequences
commandTest(
  'counter maintains correct state',
  { count: 0, initialValue: 0 },
  reactSystemFactory(() => <Counter />),
  [constant(new IncrementCommand()), /* more commands */],
  { numRuns: 50, maxCommands: 30 }
);
```

## Generators

### Primitives

- `integer(min?, max?)` - Random integers
- `nat(max?)` - Natural numbers (non-negative integers)
- `float(min?, max?)` - Random floats
- `boolean()` - Random booleans
- `string(minLen?, maxLen?)` - Random strings
- `alphaNumeric()` - Alphanumeric strings
- `ascii()` - ASCII strings
- `hexString()` - Hexadecimal strings

### Collections

- `array(gen, minLen?, maxLen?)` - Arrays of values
- `nonEmptyArray(gen, maxLen?)` - Non-empty arrays
- `tuple(gen1, gen2, ...)` - Fixed-length heterogeneous arrays
- `object({ key: gen, ... })` - Objects with specific properties
- `record(keyGen, valueGen)` - Records with uniform value types
- `set(gen)` - Sets
- `map(keyGen, valueGen)` - Maps

### Combinators

- `constant(value)` - Always return the same value
- `oneOf(gen1, gen2, ...)` - Pick one generator randomly
- `frequency([weight, gen], ...)` - Weighted choice of generators
- `gen.map(fn)` - Transform generated values
- `gen.flatMap(fn)` - Chain generators
- `gen.filter(predicate)` - Filter generated values

## Command-based Testing

Command-based testing (also called model-based testing) verifies that your component maintains invariants through arbitrary sequences of user interactions.

### How it works

1. **Define a model** - A simple representation of your component's state
2. **Define commands** - User actions (clicks, input, etc.)
3. **Implement Command interface**:
   - `check(model)` - Is this command applicable in current state?
   - `run(system)` - Execute the action on the real component
   - `nextState(model)` - Update the model
   - `verify(model, system)` - Check system matches model
4. **Run the test** - Framework generates random command sequences and verifies invariants

### Benefits

- Tests **real user interaction patterns** instead of isolated actions
- Finds **edge cases** in state transitions
- Verifies **invariants** hold throughout the component lifecycle
- **Model serves as specification** - documents expected behavior

## API Reference

### `propTest(name, generator, testFn, config?)`

Create a property-based test for Vitest.

**Parameters:**
- `name` - Test name
- `generator` - Generator for test inputs
- `testFn` - Test function receiving generated values
- `config` - Optional configuration
  - `numRuns` - Number of test cases (default: 100)
  - `seed` - Random seed for reproducibility
  - `timeout` - Timeout per test run in ms (default: 5000)

### `commandTest(name, initialModel, systemFactory, commands, config?)`

Create a command-based test for Vitest.

**Parameters:**
- `name` - Test name
- `initialModel` - Initial model state
- `systemFactory` - Function that creates a fresh system
- `commands` - Array of command generators
- `config` - Optional configuration
  - `numRuns` - Number of test sequences (default: 50)
  - `minCommands` - Minimum commands per sequence (default: 1)
  - `maxCommands` - Maximum commands per sequence (default: 20)
  - `seed` - Random seed for reproducibility

### `Command<Model, System>` Interface

```typescript
interface Command<Model, System> {
  // Can this command run in the current state?
  check(model: Model): boolean;

  // Execute the command on the actual system
  run(system: System): Promise<void> | void;

  // Update the model to reflect command effects
  nextState(model: Model): Model;

  // Verify system matches model after execution
  verify(model: Model, system: System): boolean | Promise<boolean>;

  // Human-readable description
  toString(): string;
}
```

## Examples

See the `examples/` directory for more examples:
- `basic.test.ts` - Basic property tests
- `counter.test.tsx` - Command-based React component testing

## License

MIT

## Inspiration

This framework is inspired by:
- [fast-check](https://github.com/dubzzz/fast-check) - Property-based testing for JavaScript
- [QuickCheck](https://hackage.haskell.org/package/QuickCheck) - The original property-based testing library
- [Hypothesis](https://hypothesis.readthedocs.io/) - Property-based testing for Python
