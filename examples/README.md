# Examples

This directory contains examples demonstrating how to use the React Property Tests framework.

## Files

### `basic.test.ts`
Basic property-based testing examples showing:
- Array reversal properties
- String properties
- Numeric properties
- Array concatenation associativity
- JSON serialization round-trips

### `Counter.tsx`
A simple React counter component used for command-based testing demonstrations.

### `counter.test.tsx`
Advanced command-based testing example showing:
- Model definition for component state
- Command implementations (Increment, Decrement, Reset)
- Testing with arbitrary interaction sequences
- Verifying invariants through random user interactions
- Testing boundary conditions (min/max values)

## Running the Examples

```bash
# Run all examples
npm test

# Run specific example file
npm test basic.test.ts

# Run with UI
npm run test:ui
```

## Learning Path

1. **Start with `basic.test.ts`** - Learn basic property testing concepts
2. **Read `Counter.tsx`** - See a simple React component
3. **Study `counter.test.tsx`** - Learn command-based testing for React components

## Creating Your Own Tests

### For Simple Property Tests

1. Import `propTest` and generators
2. Define your generator
3. Write your property assertion

```typescript
import { propTest, integer } from 'react-property-tests';

propTest('my property', integer(), (n) => {
  // Your assertion here
  expect(someFunction(n)).toBeSomething();
});
```

### For Command-based Component Tests

1. Define your model interface
2. Implement Command classes for each user action
3. Create initial model and system factory
4. Run commandTest with your commands

```typescript
import { commandTest, constant } from 'react-property-tests';

commandTest(
  'my component test',
  initialModel,
  systemFactory,
  [constant(new MyCommand())],
  { numRuns: 50 }
);
```
