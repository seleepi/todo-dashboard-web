'use client';

// useState: 컴포넌트의 상태(데이터)를 저장, 변경되면 리렌더링. useRef: 값을 저장하되 변경되어도 리렌더링 x
// memo: 컴포넌트 최적화(불필요한 재렌더링 방지)
import { useState, useEffect, useRef, memo } from 'react';
import { Widget, WidgetType, DashboardState } from '@/types/widget';
import { WidgetComponent } from '@/components/widgets/WidgetComponent';
import { AddWidgetButton } from '@/components/layout/AddWidgetButton';
import { GridOverlay } from '@/components/layout/GridOverlay';
import Sidebar from '@/components/layout/Sidebar';
import { getNextGridPosition, getDefaultWidgetSize } from '@/utils/grid';
import { pb, realtimeHelpers, PocketBaseEvent } from '@/lib/pocketbase';

// dashboard 객체의 구조 정의
interface Dashboard {
  id: string;
  name: string;
  background: string;
}
// dashboard 컴포넌트가 받는 입력값
// Dashboard.tsx는 부모 컴포넌트(page.tsx)에게 대시보드 객체의 상태 감지 함수를 받고, 상태 변경이 일어날 시 보고 및 처리 위임
// 이 때, 부모가 처리하는 것은 대시보드의 변경뿐으로, 대시보드 객체 내부의 상태(위젯, 사이드바 등)는 Dashboard.tsx에서 처리한다.
interface DashboardProps {
  dashboardId?: string; // ?: optional
  initialState?: DashboardState;    // 현재 사용되지 않으므로 무시
  currentDashboard?: Dashboard;
  onDashboardChange?: (dashboard: Dashboard) => void;   // 사용자가 사이드바에서 다른 대시보드를 선택했을 때 부모 컴포넌트에게 알림
  onLogout?: () => void;    // 로그아웃 버튼 눌렀을 때 처리를 부모 컴포넌트에게 위임
}

function DashboardComponent({
  dashboardId,
  initialState,
  currentDashboard,
  onDashboardChange,
  onLogout
}: DashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    widgets: initialState?.widgets || [],   // ?는 옵셔널 체이닝(initialState가 없으면 undefined 반환)
    background: initialState?.background || '#f0f9ff',  // 현재 page가 initialstate를 주지 않으므로 모두 오른쪽
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subscriptionRef = useRef<(() => void) | null>(null);    // 구독 취소 함수 저장, 컴포넌트 사라질 때 연결 끊는 용도
  const pendingActionsRef = useRef<Set<string>>(new Set()); // 처리 중인 액션 id 목록을 저장. 액션을 서버에 전송 후 서버에게 알림 받을 때 체크하여 중복 업데이트 방지


  // 컴포넌트가 처음 화면에 나타날 때, dashboardId가 변경될 때 실행
  // 서버에서 대시보드 데이터 불러오기, 실시간 구독 설정, 구독 해제를 담당
  useEffect(() => {
    if (!dashboardId || initialState) {
      return;
    }

    setIsLoading(true);

    // 서버에서 대시보드/위젯 데이터 가져오기(비동기 함수)
    const loadDashboardData = async () => {
      try {
        const dashboard = await pb.collection('dashboards').getOne(dashboardId);
        const widgets = await pb.collection('widgets').getFullList({
          filter: `dashboard = "${dashboardId}"`,
          sort: 'created'
        });

        // 서버에 저장된 widget 데이터의 형식을 변환
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

    // 위젯 실시간 구독 - 서버가 변경을 감지하면 화면 업데이트, 비동기 작업
    const setupRealTimeSubscription = async () => {
      try {
        const unsubscribe = await realtimeHelpers.subscribeToWidgets(
          dashboardId,  // 구독 대상(어떤 대시보드를 구독할지)
          (event: PocketBaseEvent) => { // 이벤트가 발생할 때마다 실행되는 콜백 함수(이벤트 처리 코드)
            console.log('실시간 이벤트:', event);

            if (event.record.dashboard !== dashboardId) {
              return;
            }
            // 본인이 방금 한 액션이면 무시 (중복 방지)
            if (pendingActionsRef.current.has(event.record.id)) {
              console.log('본인 액션 감지, 중복 업데이트 방지:', event.record.id);
              pendingActionsRef.current.delete(event.record.id);
              return;
            }

            switch (event.action) {
              case 'create':
                // 서버에서 받은 데이터를 앱에서 사용하기 위한 형식으로 변환
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
                    return prev;    // 중복체크, 이미 같은 id의 위젯이 있으면 추가하지 않음
                  }
                  return {
                    ...prev,
                    widgets: [...prev.widgets, newWidget]   // 기존 DashboardState의 widgets를 덮어쓰고 (새 위젯 추가) 새 객체 리턴 - 화면 업데이트
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
                    w.id === updatedWidget.id ? updatedWidget : w   // 업데이트된 위젯 id면 교체
                  )
                }));
                break;

              case 'delete':
                setDashboardState(prev => ({
                  ...prev,
                  widgets: prev.widgets.filter(w => w.id !== event.record.id)   // 제거된 id 외의 위젯을 리턴
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

    // cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();  // 구독 해제
        subscriptionRef.current = null;
      }
      pendingActionsRef.current.clear();    // 대기 중인 작업 삭제
    };
  }, [dashboardId, initialState]);  // dashboard를 선택할 때마다 실행


  // 위젯을 서버에 저장하거나 업데이트하는 함수
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

      if (widget.id.startsWith('tmp-')) {    // 'tmp-'은 addWidget 메서드에서 생성한 임시 아이디 - 아직 서버에 등록되지 않은 위젯을 의미
        pendingActionsRef.current.add(widget.id);

        // pocketbase에 새 위젯의 레코드 생성 후 해당 레코드 반환
        const record = await pb.collection('widgets').create(widgetData);

        pendingActionsRef.current.delete(widget.id);
        pendingActionsRef.current.add(record.id);

        setDashboardState(prev => ({
          ...prev,
          widgets: prev.widgets.map(w =>
            w.id === widget.id ? { ...w, id: record.id } : w    // tmp id를 실제 id로 변경 (변경사항의 로컬 반영 상태 -> 서버 업데이트 상태)
          )
        }));

        setTimeout(() => {
          pendingActionsRef.current.delete(record.id);
        }, 1000);

      } else {  // 새 위젯이 아니라 기존 위젯이라면: 업데이트
        pendingActionsRef.current.add(widget.id);
        // 로컬 업데이트와 재렌더링은 updateWidget 메서드에서 완료 - id가 같으므로 추가 랜더링 불필요
        await pb.collection('widgets').update(widget.id, widgetData);   // 서버 업데이트만 수행

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
      id: `tmp-${Date.now()}`,
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

    if (!widgetId.startsWith('tmp-')) {
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