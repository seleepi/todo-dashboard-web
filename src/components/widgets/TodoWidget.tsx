'use client';

import { useState } from 'react';
import { Widget, TodoItem } from '@/types/widget';

interface TodoWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

export function TodoWidget({ widget, onUpdate }: TodoWidgetProps) {
  const [newTodoText, setNewTodoText] = useState('');
  const todos = widget.data.todos || [];

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTodoText.trim(),
      completed: false,
      order: todos.length,
    };

    onUpdate({
      data: {
        ...widget.data,
        todos: [...todos, newTodo],
      },
    });

    setNewTodoText('');
  };

  const toggleTodo = (todoId: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );

    onUpdate({
      data: {
        ...widget.data,
        todos: updatedTodos,
      },
    });
  };

  const removeTodo = (todoId: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);

    onUpdate({
      data: {
        ...widget.data,
        todos: updatedTodos,
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Add new todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No tasks yet. Add one above!
          </p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="rounded"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}