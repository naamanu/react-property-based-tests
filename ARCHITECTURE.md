# Architecture

This document describes the architecture and design decisions of the React Property Tests framework.

## Overview

React Property Tests is a property-based testing framework specifically designed for React applications, with a primary focus on command-based (model-based) stateful testing.

## Core Concepts

### 1. Generators (`src/generators/`)

Generators are the foundation of property-based testing. They produce random values of specific types.

**Key files:**
- `random.ts` - Random number generator with seed support for reproducibility
- `gen.ts` - Base Generator class with combinators (map, flatMap, filter)
- `primitives.ts` - Generators for basic types (integers, strings, booleans)
- `collections.ts` - Generators for collections (arrays, objects, tuples)

**Design decisions:**
- Used Linear Congruential Generator (LCG) for predictable, reproducible random number generation
- Generators are composable through map/flatMap/filter
- Generators are pure - they don't modify state, they return new values

### 2. Property Testing (`src/property/`)

Property tests verify that a function satisfies certain properties for all (many) inputs.

**Key concepts:**
- `forAll()` - Run a property test with a generator
- `property()` - Create a property test that integrates with test runners
- Tests run multiple times (configurable, default 100) with different inputs
- On failure, reports the counterexample and seed for reproduction

### 3. Command-based Testing (`src/commands/`)

Command-based testing verifies that a system maintains invariants through arbitrary sequences of operations.

**Key files:**
- `commands.ts` - Command sequence generation and execution
- `../types/commands.ts` - Command interface definition

**How it works:**
1. Define a **Model** - simplified representation of system state
2. Define **Commands** - actions that can be performed
3. For each command, implement:
   - `check(model)` - Is this command valid in current state?
   - `run(system)` - Execute on actual system
   - `nextState(model)` - Update model
   - `verify(model, system)` - Check system matches model
4. Framework generates random command sequences
5. Executes each command on both model and system
6. Verifies they stay in sync

**Benefits:**
- Tests realistic interaction patterns
- Finds edge cases in state transitions
- Model acts as specification
- Tests both individual commands and their compositions

### 4. React Integration (`src/integrations/react.ts`)

Provides React-specific utilities for command-based testing.

**Key concepts:**
- `ReactSystem` - Wraps a rendered React component for testing
- `reactSystemFactory()` - Helper to create system factories
- Integrates with @testing-library/react for rendering and queries

### 5. Vitest Integration (`src/integrations/vitest.ts`)

Seamless integration with Vitest test runner.

**Exported functions:**
- `propTest()` - Property test that integrates with Vitest
- `commandTest()` - Command-based test that integrates with Vitest
- Both support `.only` and `.skip` modifiers

## Type System

The framework is TypeScript-first with full type safety:

```typescript
// Generators are parameterized by their output type
Gen<T>

// Commands are parameterized by model and system types
Command<Model, System>

// Property functions receive correctly typed values
property<T>(gen: Gen<T>)(fn: (value: T) => void)
```

## Test Execution Flow

### Property Test Flow

1. Create generator for input type
2. Run test N times (default 100):
   - Generate random value using seeded RNG
   - Pass to property function
   - If function throws, capture counterexample
3. Report success or failure with counterexample

### Command Test Flow

1. Create initial model and system
2. Run test N times (default 50):
   - Generate random command sequence (1-20 commands)
   - For each command:
     - Check if command is valid (`check()`)
     - Execute on system (`run()`)
     - Update model (`nextState()`)
     - Verify system matches model (`verify()`)
   - If verification fails, report failing sequence
3. Report success or failure with command sequence

## Design Decisions

### Why LCG for Random Number Generation?

- Simple to implement
- Reproducible with seeds
- Good enough distribution for testing
- Fast execution
- Matches behavior of established property testing libraries

### Why Command-based Testing Focus?

- React applications are inherently stateful
- User interactions form sequences, not isolated events
- Traditional unit tests often miss state transition bugs
- Command-based testing naturally models user behavior
- Finds bugs that unit tests miss

### Why Vitest?

- Modern, fast test runner
- Good React/Vite integration
- Jest-compatible API
- User choice (per initial requirements)

### Why Basic Generators Only?

- Keeps framework minimal and focused
- Users can compose complex generators from primitives
- Avoids opinionated React-specific generators
- Easier to maintain and understand

## Extension Points

The framework is designed to be extensible:

1. **Custom Generators** - Use `gen()` to create new generators
2. **Custom Commands** - Implement `Command<Model, System>` interface
3. **Custom Systems** - Any type can be a system (not just React)
4. **Custom Integrations** - Framework core is test-runner agnostic

## Performance Considerations

- Generators are lazy - values only generated when needed
- Random state is cloneable for independent generation
- Command sequences can be configured for length
- Test runs can be configured for count
- Timeouts prevent runaway tests

## Future Enhancements

Potential areas for expansion:

1. **Shrinking** - When a test fails, minimize the failing input
2. **Coverage-guided generation** - Track code coverage and generate inputs to increase coverage
3. **Stateful shrinking** - Minimize failing command sequences
4. **Custom reporters** - Better visualization of failing sequences
5. **Replay mode** - Replay specific failing sequences
6. **Parallel test execution** - Run test cases in parallel
7. **React-specific generators** - Optional package with common React patterns
8. **More test runner integrations** - Jest, Mocha, etc.
