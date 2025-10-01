'use client';

import { useState } from 'react';
import { Widget } from '@/types/widget';

interface RockSolidDragHandleProps {
  widget: Widget;
  onDrag: (newPosition: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function RockSolidDragHandle({ widget, onDrag, children }: RockSolidDragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header area
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      return;
    }

    // Check if click is in header area
    const widgetElement = e.currentTarget.querySelector('[data-widget-header]') as HTMLElement;
    if (widgetElement) {
      const headerRect = widgetElement.getBoundingClientRect();
      const isInHeader = (
        e.clientX >= headerRect.left &&
        e.clientX <= headerRect.right &&
        e.clientY >= headerRect.top &&
        e.clientY <= headerRect.bottom
      );
      
      if (!isInHeader) {
        return;
      }
    } else {
      // Fallback: just check if clicking in top area
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > 40) {
        return;
      }
    }

    e.preventDefault();
    e.stopPropagation();

    // Get initial positions once and store them
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidgetX = widget.position.x;
    const startWidgetY = widget.position.y;
    
    setIsDragging(true);

    // Define handlers as regular functions (not arrow functions to avoid closure issues)
    function handleMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      const newX = startWidgetX + deltaX;
      const newY = startWidgetY + deltaY;

      onDrag({ 
        x: Math.max(newX, 0), 
        y: Math.max(newY, 100) 
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${isDragging ? 'opacity-75' : ''} transition-opacity duration-150`}
      style={{ userSelect: 'none' }}
    >
      {children}
    </div>
  );
}