# Getting Started with React Property Tests

This guide will help you get started with property-based testing for your React applications.

## Installation

```bash
npm install react-property-tests
```

Make sure you have React and a test runner (Vitest recommended) installed:

```bash
npm install -D vitest @testing-library/react jsdom
```

## Your First Property Test

Let's start with a simple property test for a utility function:

```typescript
// utils.test.ts
import { propTest, integer, array } from 'react-property-tests';
import { expect } from 'vitest';

// Property: reversing an array twice gives the original array
propTest(
  'reverse is its own inverse',
  array(integer()),
  (arr) => {
    const reversed = arr.slice().reverse().reverse();
    expect(reversed).toEqual(arr);
  }
);
```

Run your tests:

```bash
npm test
```

This will generate 100 random arrays of integers and verify that reversing twice gives you back the original array.

## Understanding Generators

Generators create random test data. The framework provides many built-in generators:

```typescript
import {
  integer,    // Random integers
  string,     // Random strings
  boolean,    // Random booleans
  array,      // Arrays
  object,     // Objects
  oneOf,      // Pick one option
} from 'react-property-tests';

// Generate integers between 0 and 100
const score = integer(0, 100);

// Generate strings of length 5-20
const username = string(5, 20);

// Generate objects with specific structure
const user = object({
  id: integer(1, 1000),
  name: string(3, 30),
  active: boolean(),
});

// Generate arrays of users
const users = array(user, 0, 10);
```

## Composing Generators

Generators can be composed to create complex data:

```typescript
import { integer, constant, oneOf } from 'react-property-tests';

// Generate either 0, 1, or a random large number
const score = oneOf(
  constant(0),
  constant(1),
  integer(100, 1000)
);

// Transform generated values
const evenNumber = integer(0, 100).map(n => n * 2);

// Generate dependent values
const range = integer(0, 100).flatMap(min =>
  integer(min, 100).map(max => ({ min, max }))
);
```

## Testing React Components

Now let's test a React component. We'll use command-based testing to verify it maintains correct state through user interactions.

### Step 1: Create Your Component

```typescript
// Counter.tsx
import { useState } from 'react';

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)} data-testid="increment">
        +
      </button>
      <button onClick={() => setCount(initial)} data-testid="reset">
        Reset
      </button>
    </div>
  );
}
```

### Step 2: Define Your Model

The model is a simple representation of your component's state:

```typescript
// Counter.test.tsx
interface CounterModel {
  count: number;
  initial: number;
}
```

### Step 3: Define Commands

Commands represent user actions:

```typescript
import { Command } from 'react-property-tests';
import { ReactSystem } from 'react-property-tests';
import { fireEvent } from '@testing-library/react';

class IncrementCommand implements Command<CounterModel, ReactSystem> {
  // Is this command applicable?
  check(model: CounterModel): boolean {
    return true; // Always can increment
  }

  // Execute on the actual component
  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector('[data-testid="increment"]')!;
    fireEvent.click(button);
  }

  // Update the model
  nextState(model: CounterModel): CounterModel {
    return { ...model, count: model.count + 1 };
  }

  // Verify system matches model
  verify(model: CounterModel, system: ReactSystem): boolean {
    const display = system.container.querySelector('[data-testid="count"]');
    return display?.textContent === String(model.count);
  }

  toString(): string {
    return 'Increment';
  }
}

class ResetCommand implements Command<CounterModel, ReactSystem> {
  check(): boolean {
    return true;
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector('[data-testid="reset"]')!;
    fireEvent.click(button);
  }

  nextState(model: CounterModel): CounterModel {
    return { ...model, count: model.initial };
  }

  verify(model: CounterModel, system: ReactSystem): boolean {
    const display = system.container.querySelector('[data-testid="count"]');
    return display?.textContent === String(model.count);
  }

  toString(): string {
    return 'Reset';
  }
}
```

### Step 4: Write Your Test

```typescript
import { commandTest, constant, reactSystemFactory } from 'react-property-tests';

commandTest(
  'counter maintains correct state',
  // Initial model
  { count: 0, initial: 0 },
  // System factory - creates fresh component for each test run
  reactSystemFactory(() => <Counter initial={0} />),
  // Available commands
  [
    constant(new IncrementCommand()),
    constant(new ResetCommand()),
  ],
  // Configuration
  { numRuns: 50, maxCommands: 30 }
);
```

This test will:
1. Generate 50 random sequences of commands (up to 30 commands each)
2. Execute each sequence on both the model and the actual component
3. Verify they stay synchronized
4. Report any failures with the exact command sequence that caused the problem

## Configuration Options

### Property Test Configuration

```typescript
propTest('my test', generator, testFn, {
  numRuns: 100,     // Number of test cases
  seed: 12345,      // Random seed for reproducibility
  timeout: 5000,    // Timeout per test in ms
});
```

### Command Test Configuration

```typescript
commandTest('my test', model, system, commands, {
  numRuns: 50,      // Number of command sequences
  minCommands: 1,   // Minimum commands per sequence
  maxCommands: 20,  // Maximum commands per sequence
  seed: 12345,      // Random seed for reproducibility
});
```

## Debugging Failing Tests

When a test fails, you'll see:

1. The exact input that caused the failure (for property tests)
2. The exact command sequence that failed (for command tests)
3. The seed used, so you can reproduce the failure
4. The model state at the point of failure

Example failure output:

```
Error: Verification failed after command: Increment

Failing command sequence:
1. Increment
2. Increment
3. Reset
4. Increment

Failed at command 4

Model state:
{
  "count": 1,
  "initial": 0
}

Reproduce with seed: 1234567890
```

To reproduce, run your test with the same seed:

```typescript
commandTest('test', model, system, commands, {
  seed: 1234567890  // Use the seed from the failure
});
```

## Best Practices

1. **Keep models simple** - Models should be easier to reason about than the actual implementation

2. **Make commands granular** - Each command should represent one user action

3. **Use check() wisely** - Only allow commands that make sense in the current state

4. **Verify thoroughly** - Check all relevant aspects of the state

5. **Start with basic properties** - Test simple properties before complex ones

6. **Use meaningful test names** - Describe what property you're testing

7. **Don't over-configure** - Default settings work well for most cases

8. **Combine approaches** - Use both property tests and command tests where appropriate

## Next Steps

- Check out the `examples/` directory for more examples
- Read `ARCHITECTURE.md` to understand the framework internals
- Try writing tests for your own components
- Experiment with different generators and commands

## Getting Help

- Check the README for API documentation
- Look at the examples for patterns
- Read the source code (it's well-documented!)
