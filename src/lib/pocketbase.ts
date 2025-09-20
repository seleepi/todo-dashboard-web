import PocketBase from 'pocketbase';

// Initialize PocketBase instance
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(pocketbaseUrl);

// Disable auto-cancellation of pending requests
pb.autoCancellation(false);

// Types for our collections
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface Dashboard {
  id: string;
  user: string; // User ID
  name: string;
  background?: string;
  created: string;
  updated: string;
}

export interface WidgetRecord {
  id: string;
  dashboard: string; // Dashboard ID
  type: 'todo' | 'text' | 'clock-weather' | 'youtube';
  position_x: number;
  position_y: number;
  size_width: number;
  size_height: number;
  data: Record<string, unknown>; // JSON data for widget content
  collapsed?: boolean;
  created: string;
  updated: string;
}

// Authentication helpers
export const authHelpers = {
  // Sign up new user
  async signUp(email: string, password: string, name: string) {
    const userData = {
      email,
      password,
      passwordConfirm: password,
      name,
    };

    return await pb.collection('users').create(userData);
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    return await pb.collection('users').authWithPassword(email, password);
  },

  // Google OAuth authentication
  async signInWithGoogle() {
    try {
      console.log('Fetching auth methods from PocketBase...');
      // Get the list of available OAuth providers
      const authMethods = await pb.collection('users').listAuthMethods();
      console.log('Auth methods received:', authMethods);

      // Find Google OAuth provider
      const googleProvider = (authMethods as any).authProviders?.find(
        (provider: any) => provider.name === 'google'
      );

      console.log('Available auth providers:', (authMethods as any).authProviders);
      console.log('Google provider found:', googleProvider);

      if (!googleProvider) {
        throw new Error('Google OAuth provider is not configured in PocketBase. Please configure it in the admin panel.');
      }

      // Redirect to Google OAuth
      const authUrl = googleProvider.authUrl;

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'oauth2-popup',
        'width=500,height=600,left=' +
        (window.screen.width / 2 - 250) +
        ',top=' +
        (window.screen.height / 2 - 300)
      );

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            if (pb.authStore.isValid) {
              resolve(pb.authStore.model);
            } else {
              reject(new Error('Authentication was cancelled'));
            }
          }
        }, 1000);

        // Listen for message from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'oauth2-success') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', handleMessage);
            resolve(event.data.user);
          } else if (event.data.type === 'oauth2-error') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    pb.authStore.clear();
  },

  // Get current user
  getCurrentUser() {
    return pb.authStore.model as User | null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  // Refresh authentication
  async refresh() {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  }
};

// Dashboard helpers
export const dashboardHelpers = {
  // Get user's dashboards
  async getUserDashboards(userId: string) {
    return await pb.collection('dashboards').getList(1, 50, {
      filter: `user = "${userId}"`,
      sort: '-updated'
    });
  },

  // Create new dashboard
  async createDashboard(userId: string, name: string, background?: string) {
    const dashboardData = {
      user: userId,
      name,
      background: background || '#f0f9ff'
    };
    
    return await pb.collection('dashboards').create(dashboardData);
  },

  // Update dashboard
  async updateDashboard(dashboardId: string, data: Partial<Dashboard>) {
    return await pb.collection('dashboards').update(dashboardId, data);
  },

  // Delete dashboard
  async deleteDashboard(dashboardId: string) {
    return await pb.collection('dashboards').delete(dashboardId);
  }
};

// Widget helpers
export const widgetHelpers = {
  // Get dashboard widgets
  async getDashboardWidgets(dashboardId: string) {
    return await pb.collection('widgets').getList(1, 100, {
      filter: `dashboard = "${dashboardId}"`,
      sort: 'created'
    });
  },

  // Create new widget
  async createWidget(widgetData: Omit<WidgetRecord, 'id' | 'created' | 'updated'>) {
    return await pb.collection('widgets').create(widgetData);
  },

  // Update widget
  async updateWidget(widgetId: string, data: Partial<WidgetRecord>) {
    return await pb.collection('widgets').update(widgetId, data);
  },

  // Delete widget
  async deleteWidget(widgetId: string) {
    return await pb.collection('widgets').delete(widgetId);
  },

  // Batch update multiple widgets (for efficient drag operations)
  async batchUpdateWidgets(updates: { id: string; data: Partial<WidgetRecord> }[]) {
    const promises = updates.map(({ id, data }) => 
      pb.collection('widgets').update(id, data)
    );
    return await Promise.all(promises);
  }
};

// PocketBase realtime event types
export interface PocketBaseEvent {
  action: 'create' | 'update' | 'delete';
  record: WidgetRecord;
}

// Real-time subscription helpers
export const realtimeHelpers = {
  // Subscribe to dashboard changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToDashboard(dashboardId: string, callback: (data: any) => void) {
    return pb.collection('dashboards').subscribe(dashboardId, callback);
  },

  // Subscribe to widget changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToWidgets(dashboardId: string, callback: (event: PocketBaseEvent) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return pb.collection('widgets').subscribe('*', (e: any) => {
      // Only notify for widgets belonging to this dashboard
      if (e.record.dashboard === dashboardId) {
        callback(e);
      }
    });
  },

  // Unsubscribe from collection
  unsubscribe(subscription?: () => void) {
    if (subscription) {
      subscription();
    }
  }
};

export default pb;