'use client';

import { useState, useEffect } from 'react';
import { Widget, WidgetType, DashboardState } from '@/types/widget';
import { WidgetComponent } from '@/components/widgets/WidgetComponent';
import { AddWidgetButton } from '@/components/layout/AddWidgetButton';
import { GridOverlay } from '@/components/layout/GridOverlay';
import { getNextGridPosition, getDefaultWidgetSize } from '@/utils/grid';
import { pb, realtimeHelpers, PocketBaseEvent } from '@/lib/pocketbase';

interface DashboardProps {
  dashboardId?: string;
  initialState?: DashboardState;
}

export function Dashboard({ dashboardId, initialState }: DashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    widgets: initialState?.widgets || [],
    background: initialState?.background || '#f0f9ff', // light blue background
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  // Load widgets from PocketBase when dashboardId changes
  useEffect(() => {
    if (dashboardId && !initialState) {
      loadDashboardData();
      setupRealTimeSubscription();
    }

    // Cleanup subscription on unmount or dashboardId change
    return () => {
      if (subscription) {
        subscription();
        setSubscription(null);
      }
    };
  }, [dashboardId]);

  // Setup real-time subscription for widget changes
  const setupRealTimeSubscription = () => {
    if (!dashboardId) return;

    try {
      const unsubscribe = realtimeHelpers.subscribeToWidgets(dashboardId, (event: PocketBaseEvent) => {
        console.log('Real-time event:', event);
        
        switch (event.action) {
          case 'create':
            // Add new widget from other sources
            const newWidget: Widget = {
              id: event.record.id,
              type: event.record.type as WidgetType,
              position: { x: event.record.position_x, y: event.record.position_y },
              size: { width: event.record.size_width, height: event.record.size_height },
              data: event.record.data || {},
              collapsed: event.record.collapsed || false
            };
            
            setDashboardState(prev => {
              // Check if widget already exists to avoid duplicates
              if (prev.widgets.find(w => w.id === newWidget.id)) {
                return prev;
              }
              return {
                ...prev,
                widgets: [...prev.widgets, newWidget]
              };
            });
            break;

          case 'update':
            // Update existing widget from other sources
            const updatedWidget: Widget = {
              id: event.record.id,
              type: event.record.type as WidgetType,
              position: { x: event.record.position_x, y: event.record.position_y },
              size: { width: event.record.size_width, height: event.record.size_height },
              data: event.record.data || {},
              collapsed: event.record.collapsed || false
            };

            setDashboardState(prev => ({
              ...prev,
              widgets: prev.widgets.map(w => 
                w.id === updatedWidget.id ? updatedWidget : w
              )
            }));
            break;

          case 'delete':
            // Remove widget deleted from other sources
            setDashboardState(prev => ({
              ...prev,
              widgets: prev.widgets.filter(w => w.id !== event.record.id)
            }));
            break;
        }
      });

      setSubscription(() => unsubscribe);
    } catch (error) {
      console.error('Failed to setup real-time subscription:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load dashboard info
      const dashboard = await pb.collection('dashboards').getOne(dashboardId!);
      
      // Load widgets for this dashboard
      const widgets = await pb.collection('widgets').getFullList({
        filter: `dashboard = "${dashboardId}"`,
        sort: 'created'
      });

      const loadedWidgets: Widget[] = widgets.map(widget => ({
        id: widget.id,
        type: widget.type as WidgetType,
        position: { x: widget.position_x, y: widget.position_y },
        size: { width: widget.size_width, height: widget.size_height },
        data: widget.data || {},
        collapsed: widget.collapsed || false
      }));

      setDashboardState({
        widgets: loadedWidgets,
        background: dashboard.background || '#f0f9ff'
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWidgetToPocketBase = async (widget: Widget) => {
    if (!dashboardId) return;

    try {
      const widgetData = {
        dashboard: dashboardId,
        type: widget.type,
        position_x: widget.position.x,
        position_y: widget.position.y,
        size_width: widget.size.width,
        size_height: widget.size.height,
        data: widget.data,
        collapsed: widget.collapsed || false
      };

      if (widget.id.startsWith('widget-')) {
        // Create new widget
        const record = await pb.collection('widgets').create(widgetData);
        // Update local widget ID to match PocketBase ID
        setDashboardState(prev => ({
          ...prev,
          widgets: prev.widgets.map(w => 
            w.id === widget.id ? { ...w, id: record.id } : w
          )
        }));
      } else {
        // Update existing widget
        await pb.collection('widgets').update(widget.id, widgetData);
      }
    } catch (error) {
      console.error('Failed to save widget:', error);
    }
  };

  const addWidget = async (type: WidgetType) => {
    const position = getNextGridPosition(dashboardState.widgets);
    const size = getDefaultWidgetSize(type);
    
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      position,
      size,
      data: {}
    };

    setDashboardState(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));

    // Save to PocketBase
    await saveWidgetToPocketBase(newWidget);
  };

  const removeWidget = async (widgetId: string) => {
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));

    // Remove from PocketBase
    if (!widgetId.startsWith('widget-')) {
      try {
        await pb.collection('widgets').delete(widgetId);
      } catch (error) {
        console.error('Failed to delete widget:', error);
      }
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    // Get the current widget before updating state
    const currentWidget = dashboardState.widgets.find(w => w.id === widgetId);
    
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));

    // Save changes to PocketBase with the merged widget data
    if (currentWidget) {
      const updatedWidget = { ...currentWidget, ...updates };
      await saveWidgetToPocketBase(updatedWidget);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">대시보드를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: dashboardState.background }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">TODO Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                showGrid 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
              title="Toggle grid overlay"
            >
              Grid
            </button>
            <AddWidgetButton onAddWidget={addWidget} />
          </div>
        </div>
      </header>

      {/* Grid Overlay */}
      <GridOverlay show={showGrid} />

      {/* Dashboard Grid */}
      <main className="pt-24 p-4 relative min-h-screen">
        {dashboardState.widgets.map(widget => (
          <WidgetComponent
            key={widget.id}
            widget={widget}
            otherWidgets={dashboardState.widgets.filter(w => w.id !== widget.id)}
            onUpdate={(updates) => updateWidget(widget.id, updates)}
            onRemove={() => removeWidget(widget.id)}
          />
        ))}

        {/* Empty state */}
        {dashboardState.widgets.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center text-gray-500">
              <h2 className="text-xl mb-2">Welcome to your TODO Dashboard</h2>
              <p>Click &quot;Add Widget&quot; to get started</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}