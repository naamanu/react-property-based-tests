/**
 * A more complex example component - TodoList
 */

import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextId, setNextId] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTodo = (text: string) => {
    if (text.trim()) {
      setTodos((prev) => [...prev, { id: nextId, text: text.trim(), completed: false }]);
      setNextId((id) => id + 1);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div data-testid="todo-list">
      <input
        data-testid="new-todo"
        type="text"
        placeholder="What needs to be done?"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            addTodo(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
      <div data-testid="filter-buttons">
        <button
          data-testid="filter-all"
          onClick={() => setFilter('all')}
          disabled={filter === 'all'}
        >
          All
        </button>
        <button
          data-testid="filter-active"
          onClick={() => setFilter('active')}
          disabled={filter === 'active'}
        >
          Active
        </button>
        <button
          data-testid="filter-completed"
          onClick={() => setFilter('completed')}
          disabled={filter === 'completed'}
        >
          Completed
        </button>
      </div>
      <ul data-testid="todo-items">
        {filteredTodos.map((todo) => (
          <li key={todo.id} data-testid={`todo-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              data-testid={`toggle-${todo.id}`}
            />
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              data-testid={`text-${todo.id}`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              data-testid={`delete-${todo.id}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div data-testid="footer">
        <span data-testid="active-count">{activeCount} items left</span>
        <button onClick={clearCompleted} data-testid="clear-completed">
          Clear completed
        </button>
      </div>
    </div>
  );
}
