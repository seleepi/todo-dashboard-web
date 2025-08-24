'use client';

import { useState } from 'react';
import { Widget } from '@/types/widget';
import { findValidPosition } from '@/utils/collision';

interface DragHandleProps {
  widget: Widget;
  otherWidgets: Widget[];
  onDrag: (newPosition: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function DragHandle({ widget, otherWidgets, onDrag, children }: DragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header area, not on buttons or content
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      return;
    }

    // Only allow dragging from header area (check if click is in header region)
    const widgetElement = e.currentTarget as HTMLElement;
    const rect = widgetElement.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    // Header is roughly the first 40px of the widget (header + border)
    if (clickY > 40) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);

    // Get the dashboard container to account for its offset
    const dashboardMain = document.querySelector('main');
    const dashboardRect = dashboardMain?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // Calculate mouse position relative to dashboard container
    const mouseXInDashboard = e.clientX - dashboardRect.left;
    const mouseYInDashboard = e.clientY - dashboardRect.top;
    
    // Calculate offset from mouse to widget's top-left corner (both in dashboard coordinates)
    const offsetX = mouseXInDashboard - widget.position.x;
    const offsetY = mouseYInDashboard - widget.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to dashboard container
      const mouseXInDashboard = e.clientX - dashboardRect.left;
      const mouseYInDashboard = e.clientY - dashboardRect.top;
      
      // Calculate new position
      const newX = mouseXInDashboard - offsetX;
      const newY = mouseYInDashboard - offsetY;

      // Find valid position that doesn't collide
      const validPosition = findValidPosition(
        { x: newX, y: newY },
        widget.size,
        otherWidgets,
        widget.id
      );

      onDrag(validPosition);
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
      style={{
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}