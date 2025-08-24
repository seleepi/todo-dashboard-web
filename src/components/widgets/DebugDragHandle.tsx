'use client';

import { useState } from 'react';
import { Widget } from '@/types/widget';

interface DebugDragHandleProps {
  widget: Widget;
  onDrag: (newPosition: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export function DebugDragHandle({ widget, onDrag, children }: DebugDragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🖱️ MouseDown triggered', {
      widgetId: widget.id,
      widgetPosition: widget.position,
      mousePosition: { x: e.clientX, y: e.clientY }
    });

    // Only start dragging if clicking on the header area
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      console.log('❌ Blocked by button/no-drag');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    if (clickY > 40) {
      console.log('❌ Not in header area', { clickY });
      return;
    }

    console.log('✅ Starting drag');
    e.preventDefault();
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidgetX = widget.position.x;
    const startWidgetY = widget.position.y;

    console.log('📍 Drag start data:', {
      startMouse: { x: startMouseX, y: startMouseY },
      startWidget: { x: startWidgetX, y: startWidgetY }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      const newX = startWidgetX + deltaX;
      const newY = startWidgetY + deltaY;

      console.log('🚀 Mouse move:', {
        mouse: { x: e.clientX, y: e.clientY },
        delta: { x: deltaX, y: deltaY },
        newPosition: { x: newX, y: newY }
      });

      onDrag({ x: Math.max(newX, 0), y: Math.max(newY, 100) });
    };

    const handleMouseUp = () => {
      console.log('🛑 Mouse up - drag ended');
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  console.log('🔄 DebugDragHandle render:', {
    widgetId: widget.id,
    position: widget.position,
    isDragging
  });

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${isDragging ? 'opacity-75' : ''}`}
      style={{ userSelect: 'none' }}
    >
      {children}
    </div>
  );
}