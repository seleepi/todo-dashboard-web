'use client';

import { useState } from 'react';
import { WidgetType } from '@/types/widget';

interface AddWidgetButtonProps {
  onAddWidget: (type: WidgetType) => void;
}

export function AddWidgetButton({ onAddWidget }: AddWidgetButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const widgetTypes: { type: WidgetType; label: string; description: string }[] = [
    { type: 'todo', label: 'TODO List', description: 'Create a task list with checkboxes' },
    { type: 'text', label: 'Text & Photos', description: 'Add text content and images' },
    { type: 'clock-weather', label: 'Clock & Weather', description: 'Show time and weather info' },
    { type: 'youtube', label: 'YouTube Player', description: 'Embed YouTube videos from links' },
  ];

  const handleAddWidget = (type: WidgetType) => {
    onAddWidget(type);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Widget
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-60">
          <div className="py-2">
            {widgetTypes.map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => handleAddWidget(type)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}