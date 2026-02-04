/**
 * Advanced command-based testing example - TodoList
 * This demonstrates testing a more complex component with multiple state transitions
 */

import { describe } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { commandTest } from '../src/integrations/vitest.js';
import { reactSystemFactory } from '../src/integrations/react.js';
import { string, oneOf, constant } from '../src/generators/index.js';
import type { Command } from '../src/types/commands.js';
import type { ReactSystem } from '../src/integrations/react.js';
import type { Gen } from '../src/types/index.js';
import { TodoList } from './TodoList.js';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoModel {
  todos: Todo[];
  nextId: number;
  filter: 'all' | 'active' | 'completed';
}

/**
 * Add a new todo
 */
class AddTodoCommand implements Command<TodoModel, ReactSystem> {
  constructor(private text: string) {}

  check(): boolean {
    return this.text.trim().length > 0;
  }

  async run(system: ReactSystem): Promise<void> {
    const input = system.container.querySelector(
      '[data-testid="new-todo"]'
    ) as HTMLInputElement;
    input.value = this.text;
    fireEvent.keyDown(input, { key: 'Enter' });
  }

  nextState(model: TodoModel): TodoModel {
    return {
      ...model,
      todos: [
        ...model.todos,
        { id: model.nextId, text: this.text.trim(), completed: false },
      ],
      nextId: model.nextId + 1,
    };
  }

  verify(model: TodoModel, system: ReactSystem): boolean {
    // Query for actual todo items (li elements)
    const todoList = system.container.querySelector('[data-testid="todo-items"]');
    const items = todoList?.querySelectorAll('li') || [];

    // Count should match based on filter
    const visibleTodos = model.todos.filter((todo) => {
      if (model.filter === 'active') return !todo.completed;
      if (model.filter === 'completed') return todo.completed;
      return true;
    });

    if (items.length !== visibleTodos.length) return false;

    // Active count should be correct
    const activeCount = system.container.querySelector(
      '[data-testid="active-count"]'
    );
    const expectedActive = model.todos.filter((t) => !t.completed).length;
    return activeCount?.textContent?.includes(String(expectedActive)) ?? false;
  }

  toString(): string {
    return `AddTodo("${this.text}")`;
  }
}

/**
 * Toggle a todo's completion status
 */
class ToggleTodoCommand implements Command<TodoModel, ReactSystem> {
  constructor(private id: number) {}

  check(model: TodoModel): boolean {
    return model.todos.some((t) => t.id === this.id);
  }

  async run(system: ReactSystem): Promise<void> {
    const checkbox = system.container.querySelector(
      `[data-testid="toggle-${this.id}"]`
    ) as HTMLInputElement;
    if (checkbox) {
      fireEvent.click(checkbox);
    }
  }

  nextState(model: TodoModel): TodoModel {
    return {
      ...model,
      todos: model.todos.map((todo) =>
        todo.id === this.id ? { ...todo, completed: !todo.completed } : todo
      ),
    };
  }

  verify(model: TodoModel, system: ReactSystem): boolean {
    const activeCount = system.container.querySelector(
      '[data-testid="active-count"]'
    );
    const expectedActive = model.todos.filter((t) => !t.completed).length;
    return activeCount?.textContent?.includes(String(expectedActive)) ?? false;
  }

  toString(): string {
    return `ToggleTodo(${this.id})`;
  }
}

/**
 * Delete a todo
 */
class DeleteTodoCommand implements Command<TodoModel, ReactSystem> {
  constructor(private id: number) {}

  check(model: TodoModel): boolean {
    return model.todos.some((t) => t.id === this.id);
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      `[data-testid="delete-${this.id}"]`
    ) as HTMLButtonElement;
    if (button) {
      fireEvent.click(button);
    }
  }

  nextState(model: TodoModel): TodoModel {
    return {
      ...model,
      todos: model.todos.filter((todo) => todo.id !== this.id),
    };
  }

  verify(model: TodoModel, system: ReactSystem): boolean {
    const todoList = system.container.querySelector('[data-testid="todo-items"]');
    const items = todoList?.querySelectorAll('li') || [];
    const visibleTodos = model.todos.filter((todo) => {
      if (model.filter === 'active') return !todo.completed;
      if (model.filter === 'completed') return todo.completed;
      return true;
    });
    return items.length === visibleTodos.length;
  }

  toString(): string {
    return `DeleteTodo(${this.id})`;
  }
}

/**
 * Change filter
 */
class SetFilterCommand implements Command<TodoModel, ReactSystem> {
  constructor(private filter: 'all' | 'active' | 'completed') {}

  check(): boolean {
    return true;
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      `[data-testid="filter-${this.filter}"]`
    ) as HTMLButtonElement;
    fireEvent.click(button);
  }

  nextState(model: TodoModel): TodoModel {
    return {
      ...model,
      filter: this.filter,
    };
  }

  verify(model: TodoModel, system: ReactSystem): boolean {
    const todoList = system.container.querySelector('[data-testid="todo-items"]');
    const items = todoList?.querySelectorAll('li') || [];
    const visibleTodos = model.todos.filter((todo) => {
      if (model.filter === 'active') return !todo.completed;
      if (model.filter === 'completed') return todo.completed;
      return true;
    });
    return items.length === visibleTodos.length;
  }

  toString(): string {
    return `SetFilter(${this.filter})`;
  }
}

/**
 * Clear completed todos
 */
class ClearCompletedCommand implements Command<TodoModel, ReactSystem> {
  check(model: TodoModel): boolean {
    return model.todos.some((t) => t.completed);
  }

  async run(system: ReactSystem): Promise<void> {
    const button = system.container.querySelector(
      '[data-testid="clear-completed"]'
    ) as HTMLButtonElement;
    fireEvent.click(button);
  }

  nextState(model: TodoModel): TodoModel {
    return {
      ...model,
      todos: model.todos.filter((todo) => !todo.completed),
    };
  }

  verify(model: TodoModel, system: ReactSystem): boolean {
    const hasCompleted = model.todos.some((t) => t.completed);
    return !hasCompleted;
  }

  toString(): string {
    return 'ClearCompleted';
  }
}

// Generator that picks existing todo IDs from the model
function existingTodoId(model: TodoModel): Gen<number> {
  if (model.todos.length === 0) {
    return constant(1); // Fallback, though check() should prevent this
  }
  return oneOf(...model.todos.map((t) => constant(t.id)));
}

describe('TodoList Component - Command-based Tests', () => {
  commandTest(
    'maintains correct state through complex interaction sequences',
    // Initial model
    { todos: [], nextId: 1, filter: 'all' as const },
    // System factory
    reactSystemFactory(() => <TodoList />),
    // Commands - note: some commands need model context, but we use simple generators here
    [
      string(1, 20).map((text) => new AddTodoCommand(text)),
      constant(new SetFilterCommand('all')),
      constant(new SetFilterCommand('active')),
      constant(new SetFilterCommand('completed')),
      constant(new ClearCompletedCommand()),
      // Note: Toggle and Delete commands need existing IDs
      // In a real scenario, you might make these smarter generators
      constant(new ToggleTodoCommand(1)),
      constant(new ToggleTodoCommand(2)),
      constant(new DeleteTodoCommand(1)),
    ],
    // Config
    { numRuns: 30, maxCommands: 25, minCommands: 5 }
  );
});
