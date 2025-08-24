'use client';

import { useState } from 'react';
import { Widget } from '@/types/widget';

interface TextWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

export function TextWidget({ widget, onUpdate }: TextWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(widget.data.text || '');

  const saveText = () => {
    onUpdate({
      data: {
        ...widget.data,
        text: editText,
      },
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditText(widget.data.text || '');
    setIsEditing(false);
  };

  return (
    <div className="p-4 h-full">
      {isEditing ? (
        <div className="h-full flex flex-col">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your text here..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={saveText}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="h-full cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
          onClick={() => {
            setEditText(widget.data.text || '');
            setIsEditing(true);
          }}
        >
          {widget.data.text ? (
            <div className="whitespace-pre-wrap text-sm text-gray-900">
              {widget.data.text}
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">
              Click to add text...
            </div>
          )}
        </div>
      )}
    </div>
  );
}