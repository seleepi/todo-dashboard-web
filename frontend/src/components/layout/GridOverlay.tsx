'use client';

import { GRID_SIZE, HEADER_HEIGHT } from '@/utils/grid';

interface GridOverlayProps {
  show: boolean;
}

export function GridOverlay({ show }: GridOverlayProps) {
  if (!show) return null;

  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        ...gridStyle,
        top: HEADER_HEIGHT,
      }}
    >
      {/* Grid origin indicator */}
      <div
        className="absolute w-2 h-2 bg-blue-500 rounded-full"
        style={{
          left: GRID_SIZE - 4,
          top: GRID_SIZE - 4,
        }}
      />
      
      {/* Grid info */}
      <div className="absolute top-4 left-4 text-xs text-blue-600 bg-white/80 px-2 py-1 rounded">
        Grid: {GRID_SIZE}px (0.5cm) units
      </div>
    </div>
  );
}