import { Widget } from '@/types/widget';
import { snapToGrid, HEADER_HEIGHT, GRID_SIZE } from './grid';

// Check if two rectangles overlap
export function checkCollision(
  pos1: { x: number; y: number },
  size1: { width: number; height: number },
  pos2: { x: number; y: number },
  size2: { width: number; height: number }
): boolean {
  return !(
    pos1.x + size1.width <= pos2.x ||
    pos2.x + size2.width <= pos1.x ||
    pos1.y + size1.height <= pos2.y ||
    pos2.y + size2.height <= pos1.y
  );
}

// Check if a widget position would collide with other widgets
export function wouldCollide(
  newPosition: { x: number; y: number },
  size: { width: number; height: number },
  otherWidgets: Widget[],
  excludeWidgetId?: string
): boolean {
  return otherWidgets.some(widget => {
    if (widget.id === excludeWidgetId) return false;
    return checkCollision(newPosition, size, widget.position, widget.size);
  });
}

// Find a valid position near the desired position
export function findValidPosition(
  desiredPosition: { x: number; y: number },
  size: { width: number; height: number },
  otherWidgets: Widget[],
  excludeWidgetId?: string
): { x: number; y: number } {
  // Snap to grid first
  let x = snapToGrid(desiredPosition.x);
  let y = Math.max(snapToGrid(desiredPosition.y), HEADER_HEIGHT + GRID_SIZE);

  // Ensure minimum bounds
  x = Math.max(x, GRID_SIZE);
  y = Math.max(y, HEADER_HEIGHT + GRID_SIZE);

  // If no collision, return the position
  if (!wouldCollide({ x, y }, size, otherWidgets, excludeWidgetId)) {
    return { x, y };
  }

  // Try to find a nearby position
  const searchRadius = 10; // grid units to search
  for (let radius = 1; radius <= searchRadius; radius++) {
    // Try positions in expanding rings around the desired position
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the edge of the current ring
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const testX = x + dx * GRID_SIZE;
        const testY = y + dy * GRID_SIZE;

        // Ensure within bounds
        if (testX < GRID_SIZE || testY < HEADER_HEIGHT + GRID_SIZE) continue;

        if (!wouldCollide({ x: testX, y: testY }, size, otherWidgets, excludeWidgetId)) {
          return { x: testX, y: testY };
        }
      }
    }
  }

  // If no valid position found, return original position (might overlap)
  return { x, y };
}

// Get all occupied grid positions
export function getOccupiedPositions(widgets: Widget[]): Set<string> {
  const occupied = new Set<string>();
  
  widgets.forEach(widget => {
    const startX = Math.floor(widget.position.x / GRID_SIZE);
    const startY = Math.floor(widget.position.y / GRID_SIZE);
    const endX = Math.floor((widget.position.x + widget.size.width) / GRID_SIZE);
    const endY = Math.floor((widget.position.y + widget.size.height) / GRID_SIZE);

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        occupied.add(`${x},${y}`);
      }
    }
  });

  return occupied;
}