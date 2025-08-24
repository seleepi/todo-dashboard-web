'use client';

import { useState, useRef } from 'react';
import { Widget } from '@/types/widget';
import { snapToGrid, HEADER_HEIGHT } from '@/utils/grid';

interface SimpleDragHandleProps {
  widget: Widget;
  onDrag: (newPosition: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function SimpleDragHandle({ widget, onDrag, children }: SimpleDragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragData = useRef({ startX: 0, startY: 0, startWidgetX: 0, startWidgetY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the draggable header area
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      return;
    }

    // Check if clicking in header area
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    if (clickY > 40) {
      return; // Not in header area
    }

    e.preventDefault();
    setIsDragging(true);

    // Store initial positions
    dragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidgetX: widget.position.x,
      startWidgetY: widget.position.y
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate how much mouse has moved
      const deltaX = e.clientX - dragData.current.startX;
      const deltaY = e.clientY - dragData.current.startY;

      // Calculate new widget position
      const newX = dragData.current.startWidgetX + deltaX;
      const newY = dragData.current.startWidgetY + deltaY;

      // Snap to grid and ensure minimum bounds
      const snappedX = snapToGrid(Math.max(newX, 0));
      const snappedY = snapToGrid(Math.max(newY, HEADER_HEIGHT + 19));

      onDrag({ x: snappedX, y: snappedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${isDragging ? 'opacity-75 scale-105 z-50' : ''} transition-all duration-150`}
      style={{ userSelect: 'none' }}
    >
      {children}
    </div>
  );
}