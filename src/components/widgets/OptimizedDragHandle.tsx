'use client';

import { useState, useRef } from 'react';
import { Widget } from '@/types/widget';

interface OptimizedDragHandleProps {
  widget: Widget;
  onDrag: (newPosition: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function OptimizedDragHandle({ widget, onDrag, children }: OptimizedDragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    isDragging: boolean;
    startMouseX: number;
    startMouseY: number;
    startWidgetX: number;
    startWidgetY: number;
    handlers: {
      handleMouseMove: ((e: MouseEvent) => void) | null;
      handleMouseUp: (() => void) | null;
    };
  }>({
    isDragging: false,
    startMouseX: 0,
    startMouseY: 0,
    startWidgetX: 0,
    startWidgetY: 0,
    handlers: {
      handleMouseMove: null,
      handleMouseUp: null
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header area
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    if (clickY > 40) {
      return;
    }

    e.preventDefault();
    
    // Store drag state in ref to avoid re-renders
    dragStateRef.current.isDragging = true;
    dragStateRef.current.startMouseX = e.clientX;
    dragStateRef.current.startMouseY = e.clientY;
    dragStateRef.current.startWidgetX = widget.position.x;
    dragStateRef.current.startWidgetY = widget.position.y;
    
    setIsDragging(true);

    // Create stable event handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      
      const deltaX = e.clientX - dragStateRef.current.startMouseX;
      const deltaY = e.clientY - dragStateRef.current.startMouseY;
      const newX = dragStateRef.current.startWidgetX + deltaX;
      const newY = dragStateRef.current.startWidgetY + deltaY;

      // Only call onDrag, don't trigger local re-renders
      onDrag({ 
        x: Math.max(newX, 0), 
        y: Math.max(newY, 100) 
      });
    };

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false;
      setIsDragging(false);
      
      // Clean up event listeners
      if (dragStateRef.current.handlers.handleMouseMove) {
        document.removeEventListener('mousemove', dragStateRef.current.handlers.handleMouseMove);
      }
      if (dragStateRef.current.handlers.handleMouseUp) {
        document.removeEventListener('mouseup', dragStateRef.current.handlers.handleMouseUp);
      }
      
      dragStateRef.current.handlers.handleMouseMove = null;
      dragStateRef.current.handlers.handleMouseUp = null;
    };

    // Store handlers in ref
    dragStateRef.current.handlers.handleMouseMove = handleMouseMove;
    dragStateRef.current.handlers.handleMouseUp = handleMouseUp;

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