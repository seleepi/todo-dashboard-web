'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { Widget, WidgetType, DashboardState } from '@/types/widget';
import { WidgetComponent } from '@/components/widgets/WidgetComponent';
import { AddWidgetButton } from '@/components/layout/AddWidgetButton';
import { GridOverlay } from '@/components/layout/GridOverlay';
import Sidebar from '@/components/layout/Sidebar';
import { getNextGridPosition, getDefaultWidgetSize } from '@/utils/grid';
import { pb, realtimeHelpers, PocketBaseEvent } from '@/lib/pocketbase';

interface Dashboard {
  id: string;
  name: string;
  background: string;
}

interface DashboardProps {
  dashboardId?: string;
  initialState?: DashboardState;
  currentDashboard?: Dashboard;
  onDashboardChange?: (dashboard: Dashboard) => void;
  onLogout?: () => void;
}

function DashboardComponent({
  dashboardId,
  initialState,
  currentDashboard,
  onDashboardChange,
  onLogout
}: DashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    widgets: initialState?.widgets || [],
    background: initialState?.background || '#f0f9ff',
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subscriptionRef = useRef<(() => void) | null>(null);
  const pendingActionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!dashboardId || initialState) {
      return;
    }

    setIsLoading(true);

    const loadDashboardData = async () => {
      try {
        const dashboard = await pb.collection('dashboards').getOne(dashboardId);
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
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ async 함수로 변경!
    const setupRealTimeSubscription = async () => {
      try {
        // ✅ await 추가!
        const unsubscribe = await realtimeHelpers.subscribeToWidgets(
          dashboardId,
          (event: PocketBaseEvent) => {
            console.log('실시간 이벤트:', event);

            if (event.record.dashboard !== dashboardId) {
              return;
            }

            if (pendingActionsRef.current.has(event.record.id)) {
              console.log('본인 액션 감지, 중복 업데이트 방지:', event.record.id);
              pendingActionsRef.current.delete(event.record.id);
              return;
            }

            switch (event.action) {
              case 'create':
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
                    return prev;
                  }
                  return {
                    ...prev,
                    widgets: [...prev.widgets, newWidget]
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
                    w.id === updatedWidget.id ? updatedWidget : w
                  )
                }));
                break;

              case 'delete':
                setDashboardState(prev => ({
                  ...prev,
                  widgets: prev.widgets.filter(w => w.id !== event.record.id)
                }));
                break;
            }
          }
        );

        subscriptionRef.current = unsubscribe;
      } catch (error) {
        console.error('실시간 구독 설정 실패:', error);
      }
    };

    loadDashboardData();
    setupRealTimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      pendingActionsRef.current.clear();
    };
  }, [dashboardId, initialState]);

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
        pendingActionsRef.current.add(widget.id);

        const record = await pb.collection('widgets').create(widgetData);

        pendingActionsRef.current.delete(widget.id);
        pendingActionsRef.current.add(record.id);

        setDashboardState(prev => ({
          ...prev,
          widgets: prev.widgets.map(w =>
            w.id === widget.id ? { ...w, id: record.id } : w
          )
        }));

        setTimeout(() => {
          pendingActionsRef.current.delete(record.id);
        }, 1000);
      } else {
        pendingActionsRef.current.add(widget.id);

        await pb.collection('widgets').update(widget.id, widgetData);

        setTimeout(() => {
          pendingActionsRef.current.delete(widget.id);
        }, 1000);
      }
    } catch (error) {
      console.error('위젯 저장 실패:', error);
      pendingActionsRef.current.delete(widget.id);
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

    await saveWidgetToPocketBase(newWidget);
  };

  const removeWidget = async (widgetId: string) => {
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));

    if (!widgetId.startsWith('widget-')) {
      try {
        pendingActionsRef.current.add(widgetId);
        await pb.collection('widgets').delete(widgetId);

        setTimeout(() => {
          pendingActionsRef.current.delete(widgetId);
        }, 1000);
      } catch (error) {
        console.error('위젯 삭제 실패:', error);
        pendingActionsRef.current.delete(widgetId);
      }
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    const currentWidget = dashboardState.widgets.find(w => w.id === widgetId);

    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));

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
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="메뉴 열기"
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