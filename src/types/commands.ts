/**
 * Types for command-based (model-based) stateful testing
 */

/**
 * A command represents an action that can be performed on a system
 * @template Model - The type representing the model state
 * @template System - The type of the actual system under test
 */
export interface Command<Model, System> {
  /**
   * Check if this command can be executed in the current state
   * @param model - Current model state
   * @returns true if command is applicable
   */
  check(model: Model): boolean;

  /**
   * Execute the command on the actual system
   * @param system - The actual system under test
   * @returns Promise that resolves when command completes
   */
  run(system: System): Promise<void> | void;

  /**
   * Update the model to reflect the command's effects
   * @param model - Current model state
   * @returns New model state after command
   */
  nextState(model: Model): Model;

  /**
   * Verify that the system matches the model after execution
   * @param model - Expected model state
   * @param system - Actual system state
   * @returns true if system matches model
   */
  verify(model: Model, system: System): boolean | Promise<boolean>;

  /** Human-readable description of this command */
  toString(): string;
}

/**
 * Result of executing a command sequence
 */
export interface CommandSequenceResult {
  success: boolean;
  failedAt?: number;
  commands?: string[];
  error?: Error;
  modelState?: unknown;
  systemState?: unknown;
}

/**
 * Configuration for command-based testing
 */
export interface CommandConfig {
  /** Maximum length of generated command sequences */
  maxCommands?: number;
  /** Minimum length of generated command sequences */
  minCommands?: number;
  /** Number of command sequences to test */
  numRuns?: number;
  /** Maximum shrink attempts */
  maxShrinks?: number;
  /** Seed for reproducibility */
  seed?: number;
}
