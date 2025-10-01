export type WidgetType = 'todo' | 'text' | 'clock-weather' | 'youtube';

export interface Widget {
  id: string;
  type: WidgetType;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  data: WidgetData;
  collapsed?: boolean;
}

export interface WidgetData {
  // TODO widget data
  todos?: TodoItem[];
  
  // Text widget data
  text?: string;
  image?: string;
  
  // Clock & Weather widget data
  location?: string;
  
  // YouTube widget data
  youtubeUrl?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface DashboardState {
  widgets: Widget[];
  background?: string;
}