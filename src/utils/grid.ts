// Grid system constants
export const GRID_SIZE = 19; // 0.5cm ≈ 19px
export const HEADER_HEIGHT = 96; // Fixed header height

// Snap position to grid
export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

// Snap size to grid (minimum 1 grid unit)
export function snapSizeToGrid(value: number): number {
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE;
  return Math.max(snapped, GRID_SIZE); // Minimum 1 grid unit
}

// Convert grid units to pixels
export function gridToPixels(gridUnits: number): number {
  return gridUnits * GRID_SIZE;
}

// Convert pixels to grid units
export function pixelsToGrid(pixels: number): number {
  return Math.round(pixels / GRID_SIZE);
}

// Get grid position for new widget
export function getNextGridPosition(existingWidgets: { position: { x: number; y: number }; size: { width: number; height: number } }[]): { x: number; y: number } {
  const margin = GRID_SIZE; // 1 grid unit margin
  const startX = margin;
  const startY = HEADER_HEIGHT + margin;

  // Default widget size in grid units
  const defaultWidgetWidth = gridToPixels(16); // 16 grid units ≈ 304px
  const defaultWidgetHeight = gridToPixels(11); // 11 grid units ≈ 209px

  // Calculate how many widgets fit in a row
  const availableWidth = window.innerWidth - (margin * 2);
  const widgetsPerRow = Math.floor(availableWidth / (defaultWidgetWidth + margin));
  
  // Find next available position
  const row = Math.floor(existingWidgets.length / widgetsPerRow);
  const col = existingWidgets.length % widgetsPerRow;
  
  return {
    x: snapToGrid(startX + col * (defaultWidgetWidth + margin)),
    y: snapToGrid(startY + row * (defaultWidgetHeight + margin))
  };
}

// Predefined widget size presets (in grid units)
export const WIDGET_SIZE_PRESETS = {
  small: { width: gridToPixels(12), height: gridToPixels(8) },   // 12x8 grid units
  medium: { width: gridToPixels(16), height: gridToPixels(11) }, // 16x11 grid units  
  large: { width: gridToPixels(20), height: gridToPixels(14) },  // 20x14 grid units
  wide: { width: gridToPixels(24), height: gridToPixels(8) },    // 24x8 grid units
  tall: { width: gridToPixels(12), height: gridToPixels(16) }    // 12x16 grid units
};

// Get widget size preset based on type
export function getDefaultWidgetSize(type: string): { width: number; height: number } {
  switch (type) {
    case 'todo':
      return WIDGET_SIZE_PRESETS.medium;
    case 'text':
      return WIDGET_SIZE_PRESETS.medium;
    case 'clock-weather':
      return WIDGET_SIZE_PRESETS.small;
    case 'youtube':
      return WIDGET_SIZE_PRESETS.large;
    default:
      return WIDGET_SIZE_PRESETS.medium;
  }
}