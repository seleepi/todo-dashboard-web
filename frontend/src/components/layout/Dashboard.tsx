'use client';

// useState: stores component state (data), triggers re-render on change. useRef: stores value but doesn't trigger re-render on change
// memo: component optimization (prevents unnecessary re-renders)
import { useState, useEffect, useRef, memo } from 'react';
import { Widget, WidgetType, DashboardState } from '@/types/widget';
import { WidgetComponent } from '@/components/widgets/WidgetComponent';
import { AddWidgetButton } from '@/components/layout/AddWidgetButton';
import { GridOverlay } from '@/components/layout/GridOverlay';
import Sidebar from '@/components/layout/Sidebar';
import { getNextGridPosition, getDefaultWidgetSize } from '@/utils/grid';
import { pb, realtimeHelpers, PocketBaseEvent } from '@/lib/pocketbase';

// Define structure of dashboard object
interface Dashboard {
  id: string;
  name: string;
  background: string;
}
// Input values received by dashboard component
// Dashboard.tsx receives state monitoring functions from parent component (page.tsx), reports state changes and delegates handling
// Parent handles only dashboard switching, while Dashboard.tsx handles internal state (widgets, sidebar, etc.)
interface DashboardProps {
  dashboardId?: string; // ?: optional
  initialState?: DashboardState;    // Currently unused, ignore
  currentDashboard?: Dashboard;
  onDashboardChange?: (dashboard: Dashboard) => void;   // Notify parent component when user selects different dashboard from sidebar
  onLogout?: () => void;    // Delegate logout button handling to parent component
}

function DashboardComponent({
  dashboardId,
  initialState,
  currentDashboard,
  onDashboardChange,
  onLogout
}: DashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    widgets: initialState?.widgets || [],   // ? is optional chaining (returns undefined if initialState doesn't exist)
    background: initialState?.background || '#f0f9ff',  // Currently page doesn't provide initialState, so always uses right side
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subscriptionRef = useRef<(() => void) | null>(null);    // Store unsubscribe function, used to disconnect when component unmounts
  const pendingActionsRef = useRef<Set<string>>(new Set()); // Store list of action IDs being processed. Check when receiving server notification after sending action to prevent duplicate updates


  // Execute when component first appears on screen or when dashboardId changes
  // Responsible for loading dashboard data from server, setting up real-time subscription, and unsubscribing
  useEffect(() => {
    if (!dashboardId || initialState) {
      return;
    }

    setIsLoading(true);

    // Fetch dashboard/widget data from server (async function)
    const loadDashboardData = async () => {
      try {
        const dashboard = await pb.collection('dashboards').getOne(dashboardId);
        const widgets = await pb.collection('widgets').getFullList({
          filter: `dashboard = "${dashboardId}"`,
          sort: 'created'
        });

        // Convert format of widget data stored on server
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

    // Real-time widget subscription - update screen when server detects changes, async operation
    const setupRealTimeSubscription = async () => {
      try {
        const unsubscribe = await realtimeHelpers.subscribeToWidgets(
          dashboardId,  // Subscription target (which dashboard to subscribe to)
          (event: PocketBaseEvent) => { // Callback function executed whenever event occurs (event handling code)
            console.log('Real-time event:', event);

            if (event.record.dashboard !== dashboardId) {
              return;
            }
            // Ignore if it's own action just performed (prevent duplication)
            if (pendingActionsRef.current.has(event.record.id)) {
              console.log('Own action detected, preventing duplicate update:', event.record.id);
              pendingActionsRef.current.delete(event.record.id);
              return;
            }

            switch (event.action) {
              case 'create':
                // Convert data received from server to format used by app
                const newWidget: Widget = {
                  id: event.record.id,
                  type: event.record.type as WidgetType,
                  position: { x: event.record.position_x, y: event.record.position_y },
                  size: { width: event.record.size_width, height: event.record.size_height },
                  data: event.record.data || {},
                  collapsed: event.record.collapsed || false
                };

                setDashboardState(prev => {
                  if (prev.widgets.find(w => w.id === newWidget.id)) {
                    return prev;    // Duplicate check, don't add if widget with same id already exists
                  }
                  return {
                    ...prev,
                    widgets: [...prev.widgets, newWidget]   // Overwrite widgets in existing DashboardState (add new widget) and return new object - update screen
                  };
                });
                break;

              case 'update':
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
                    w.id === updatedWidget.id ? updatedWidget : w   // Replace if it's the updated widget id
                  )
                }));
                break;

              case 'delete':
                setDashboardState(prev => ({
                  ...prev,
                  widgets: prev.widgets.filter(w => w.id !== event.record.id)   // Return widgets except the deleted id
                }));
                break;
            }
          }
        );

        subscriptionRef.current = unsubscribe;
      } catch (error) {
        console.error('Failed to setup real-time subscription:', error);
      }
    };

    loadDashboardData();
    setupRealTimeSubscription();

    // cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();  // Unsubscribe
        subscriptionRef.current = null;
      }
      pendingActionsRef.current.clear();    // Delete pending operations
    };
  }, [dashboardId, initialState]);  // Execute whenever dashboard is selected


  // Function to save or update widget on server
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

      if (widget.id.startsWith('tmp-')) {    // 'tmp-' is temporary ID created by addWidget method - indicates widget not yet registered on server
        pendingActionsRef.current.add(widget.id);   // Optimistic UI Update: immediate re-render with temporary ID in addWidget - re-render again after receiving actual id

        // Create new widget record in pocketbase and return the record
        const record = await pb.collection('widgets').create(widgetData);

        pendingActionsRef.current.delete(widget.id);
        pendingActionsRef.current.add(record.id);

        setDashboardState(prev => ({
          ...prev,
          widgets: prev.widgets.map(w =>
            w.id === widget.id ? { ...w, id: record.id } : w    // Change tmp id to actual id (local state of changes -> server update state)
          )
        }));

        setTimeout(() => {
          pendingActionsRef.current.delete(record.id);
        }, 1000);

      } else {  // If existing widget, not new widget: update
        pendingActionsRef.current.add(widget.id);
        // Local update and re-render completed in updateWidget method - no additional rendering needed since id is same
        await pb.collection('widgets').update(widget.id, widgetData);   // Only perform server update

        setTimeout(() => {
          pendingActionsRef.current.delete(widget.id);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to save widget:', error);
      pendingActionsRef.current.delete(widget.id);
    }
  };


  const addWidget = async (type: WidgetType) => {
    const position = getNextGridPosition(dashboardState.widgets);
    const size = getDefaultWidgetSize(type);

    const newWidget: Widget = {
      id: `tmp-${Date.now()}`,  // temp id
      type,
      position,
      size,
      data: {}
    };

    // Optimistic UI Update: immediate re-render with temporary ID for user experience - re-render again in SaveWidgetToPocketBase after receiving actual id
    setDashboardState(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));

    await saveWidgetToPocketBase(newWidget);
  };


  const removeWidget = async (widgetId: string) => {
    setDashboardState(prev => ({    // Immediately remove from screen
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));

    if (!widgetId.startsWith('tmp-')) { // If temporary widget, no need to request server
      try {
        pendingActionsRef.current.add(widgetId);
        await pb.collection('widgets').delete(widgetId);    // Request deletion from server

        setTimeout(() => {
          pendingActionsRef.current.delete(widgetId);
        }, 1000);
      } catch (error) {
        console.error('Failed to delete widget:', error);
        pendingActionsRef.current.delete(widgetId);
      }
    }
  };

  // Function to update widget when its information is modified
  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    const currentWidget = dashboardState.widgets.find(w => w.id === widgetId);

    setDashboardState(prev => ({    // Update local state
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));

    if (currentWidget) {    // Previous widget + changes -> update server
      const updatedWidget = { ...currentWidget, ...updates };
      await saveWidgetToPocketBase(updatedWidget);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: dashboardState.background }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-lg text-gray-700">Loading dashboard...</div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentDashboard?.name || 'TODO Dashboard'}
              </h1>
              {currentDashboard && (
                <p className="text-sm text-gray-500">ID: {currentDashboard.id}</p>
              )}
            </div>
          </div>
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

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentDashboard={currentDashboard || null}
        onDashboardSelect={(dashboard) => {
          if (onDashboardChange) {
            onDashboardChange(dashboard);
          }
        }}
        onLogout={() => {
          if (onLogout) {
            onLogout();
          }
        }}
      />

      <GridOverlay show={showGrid} />

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

export const Dashboard = memo(DashboardComponent);