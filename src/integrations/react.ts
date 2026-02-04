/**
 * React-specific utilities for property-based testing
 */

import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';

/**
 * React component system wrapper for command-based testing
 */
export interface ReactSystem {
  /** The rendered component */
  rendered: RenderResult;
  /** Container element */
  container: HTMLElement;
  /** Unmount the component */
  unmount: () => void;
  /** Rerender with new props */
  rerender: (element: ReactElement) => void;
}

/**
 * Create a React system for testing
 */
export function createReactSystem(component: ReactElement): ReactSystem {
  const rendered = render(component);

  return {
    rendered,
    container: rendered.container,
    unmount: rendered.unmount,
    rerender: rendered.rerender,
  };
}

/**
 * Helper to create a system factory for React components
 */
export function reactSystemFactory(
  createComponent: () => ReactElement
): () => ReactSystem {
  return () => createReactSystem(createComponent());
}
