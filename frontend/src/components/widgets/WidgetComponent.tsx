'use client';

import { Widget } from '@/types/widget';
import { TodoWidget } from './TodoWidget';
import { TextWidget } from './TextWidget';
import { ClockWeatherWidget } from './ClockWeatherWidget';
import { YouTubeWidget } from './YouTubeWidget';
import { ResizeHandle } from './ResizeHandle';
import { RockSolidDragHandle } from './RockSolidDragHandle';
import { snapToGrid, snapSizeToGrid, HEADER_HEIGHT } from '@/utils/grid';

interface WidgetComponentProps {
  widget: Widget;
  otherWidgets: Widget[];
  onUpdate: (updates: Partial<Widget>) => void;
  onRemove: () => void;
}

export function WidgetComponent({ widget, otherWidgets, onUpdate, onRemove }: WidgetComponentProps) {
  const handleResize = (newWidth: number, newHeight: number) => {
    onUpdate({
      size: { width: newWidth, height: newHeight }
    });
  };

  const handleDrag = (newPosition: { x: number; y: number }) => {
    onUpdate({
      position: newPosition
    });
  };

  const renderWidget = () => {
    switch (widget.type) {
      case 'todo':
        return <TodoWidget widget={widget} onUpdate={onUpdate} />;
      case 'text':
        return <TextWidget widget={widget} onUpdate={onUpdate} />;
      case 'clock-weather':
        return <ClockWeatherWidget widget={widget} onUpdate={onUpdate} />;
      case 'youtube':
        return <YouTubeWidget widget={widget} onUpdate={onUpdate} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <RockSolidDragHandle
      widget={widget}
      onDrag={handleDrag}
    >
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden group z-10 transition-shadow duration-150 hover:shadow-xl"
        style={{
          left: snapToGrid(widget.position.x),
          top: Math.max(snapToGrid(widget.position.y), HEADER_HEIGHT + 19), // Snap to grid + header margin
          width: snapSizeToGrid(widget.size.width),
          height: snapSizeToGrid(widget.size.height),
        }}
      >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b" data-widget-header>
        <div className="flex items-center space-x-2 flex-1 cursor-grab active:cursor-grabbing">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span className="text-sm font-medium text-gray-600">
            {getWidgetTitle(widget.type)}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" data-no-drag>
          {widget.collapsed ? (
            <button
              onClick={() => onUpdate({ collapsed: false })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Expand"
              data-no-drag
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => onUpdate({ collapsed: true })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Collapse"
              data-no-drag
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 6a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Remove"
            data-no-drag
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 overflow-hidden" data-no-drag>
        {!widget.collapsed && renderWidget()}
      </div>

      {/* Resize Handles */}
      {!widget.collapsed && (
        <ResizeHandle
          onResize={handleResize}
          currentWidth={widget.size.width}
          currentHeight={widget.size.height}
        />
      )}
      </div>
    </RockSolidDragHandle>
  );
}

function getWidgetTitle(type: string): string {
  switch (type) {
    case 'todo': return 'TODO List';
    case 'text': return 'Text & Photos';
    case 'clock-weather': return 'Clock & Weather';
    case 'youtube': return 'YouTube Player';
    default: return 'Widget';
  }
}