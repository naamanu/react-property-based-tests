/**
 * Example React component for testing
 */

import { useState } from 'react';

interface CounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
}

export function Counter({ initialValue = 0, min, max }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    setCount((c) => {
      const newValue = c + 1;
      return max !== undefined && newValue > max ? c : newValue;
    });
  };

  const decrement = () => {
    setCount((c) => {
      const newValue = c - 1;
      return min !== undefined && newValue < min ? c : newValue;
    });
  };

  const reset = () => {
    setCount(initialValue);
  };

  return (
    <div>
      <div data-testid="count">{count}</div>
      <button onClick={increment} data-testid="increment">
        +
      </button>
      <button onClick={decrement} data-testid="decrement">
        -
      </button>
      <button onClick={reset} data-testid="reset">
        Reset
      </button>
    </div>
  );
}
