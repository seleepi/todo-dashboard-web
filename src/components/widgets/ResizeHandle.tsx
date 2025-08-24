'use client';

import { useState, useCallback } from 'react';
import { snapSizeToGrid, GRID_SIZE } from '@/utils/grid';

interface ResizeHandleProps {
  onResize: (newWidth: number, newHeight: number) => void;
  currentWidth: number;
  currentHeight: number;
}

export function ResizeHandle({ onResize, currentWidth, currentHeight }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentWidth;
    const startHeight = currentHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(startWidth + deltaX, GRID_SIZE * 6); // Minimum 6 grid units
      const newHeight = Math.max(startHeight + deltaY, GRID_SIZE * 4); // Minimum 4 grid units
      
      // Snap to grid while resizing
      onResize(snapSizeToGrid(newWidth), snapSizeToGrid(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize, currentWidth, currentHeight]);

  return (
    <>
      {/* Bottom-right corner resize handle */}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity ${
          isResizing ? 'opacity-100' : ''
        }`}
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(-45deg, transparent 30%, #94a3b8 30%, #94a3b8 70%, transparent 70%)',
        }}
        title="Resize widget"
      />
      
      {/* Right edge resize handle */}
      <div
        className={`absolute top-2 bottom-2 right-0 w-2 cursor-e-resize opacity-0 group-hover:opacity-30 transition-opacity ${
          isResizing ? 'opacity-30' : ''
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);

          const startX = e.clientX;
          const startWidth = currentWidth;

          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(startWidth + deltaX, GRID_SIZE * 6);
            onResize(snapSizeToGrid(newWidth), currentHeight);
          };

          const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        style={{
          background: 'rgba(148, 163, 184, 0.3)',
        }}
      />
      
      {/* Bottom edge resize handle */}
      <div
        className={`absolute bottom-0 left-2 right-2 h-2 cursor-s-resize opacity-0 group-hover:opacity-30 transition-opacity ${
          isResizing ? 'opacity-30' : ''
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);

          const startY = e.clientY;
          const startHeight = currentHeight;

          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const newHeight = Math.max(startHeight + deltaY, GRID_SIZE * 4);
            onResize(currentWidth, snapSizeToGrid(newHeight));
          };

          const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        style={{
          background: 'rgba(148, 163, 184, 0.3)',
        }}
      />
    </>
  );
}