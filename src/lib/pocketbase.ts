import PocketBase from 'pocketbase';

// Initialize PocketBase instance
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')
    ? 'https://todo-dashboard-pocketbase.up.railway.app'
    : 'http://127.0.0.1:8090');

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

  // Google OAuth authentication using manual flow (v2)
  async signInWithGoogle() {
    try {
      console.log('Starting manual Google OAuth flow v2...');

      // Get auth methods using direct fetch (same as debugger)
      console.log('Using direct fetch to get auth methods...');
      const response = await fetch(`${pb.baseUrl}/api/collections/users/auth-methods`);
      const authMethods = await response.json();
      console.log('Raw auth methods from direct fetch:', authMethods);
      console.log('AuthProviders array:', authMethods.authProviders);

      const googleProvider = authMethods.authProviders?.find(
        (provider: any) => provider.name === 'google'
      );

      console.log('Google provider search result:', googleProvider);

      if (!googleProvider) {
        console.error('Google OAuth provider not found!');
        console.error('Available providers:', authMethods.authProviders);
        throw new Error('Google OAuth provider is not configured in PocketBase');
      }

      console.log('Google provider found:', googleProvider);

      // Store the codeVerifier and state for the OAuth redirect
      const codeVerifier = googleProvider.codeVerifier;
      const state = googleProvider.state;

      // Store these in sessionStorage for the redirect page to access
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_code_verifier', codeVerifier);
        sessionStorage.setItem('oauth_state', state);
        console.log('Stored OAuth state and codeVerifier in sessionStorage');
      }

      // Fix the redirect_uri by properly parsing and reconstructing URL
      let authUrl = googleProvider.authUrl;
      try {
        const url = new URL(authUrl);

        // CRITICAL FIX: Google should redirect to Next.js app, not PocketBase
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
        const correctRedirectUri = `${currentDomain}/oauth2-redirect`;

        console.log('Current domain:', currentDomain);
        console.log('Correct Next.js redirect URI:', correctRedirectUri);

        // Always set the correct redirect URI to Next.js app
        url.searchParams.set('redirect_uri', correctRedirectUri);
        authUrl = url.toString();
        console.log('Final corrected auth URL:', authUrl);
      } catch (urlError) {
        console.error('Failed to parse OAuth URL:', urlError);
        // Fallback to the old method if URL parsing fails
        if (authUrl.includes('redirect_uri=') && authUrl.endsWith('redirect_uri=')) {
          const correctRedirectUri = encodeURIComponent(`${window.location.origin}/oauth2-redirect`);
          authUrl = authUrl.replace('redirect_uri=', `redirect_uri=${correctRedirectUri}`);
          console.log('Used fallback method for auth URL:', authUrl);
        }
      }

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,left=' +
        (window.screen.width / 2 - 250) +
        ',top=' +
        (window.screen.height / 2 - 300)
      );

      if (!popup) {
        throw new Error('Failed to open popup. Please check your browser\'s popup blocker settings.');
      }

      return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        let authChangeUnsubscribe: (() => void) | null = null;

        // Clean up function
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          if (authChangeUnsubscribe) authChangeUnsubscribe();
          try {
            popup?.close();
          } catch (e) {
            console.log('Could not close popup (Cross-Origin policy)');
          }
        };

        // Listen for auth store changes (primary detection method)
        const handleAuthChange = () => {
          if (pb.authStore.isValid) {
            console.log('Google OAuth successful - auth store change detected');
            cleanup();
            resolve(pb.authStore.model);
          }
        };

        // Subscribe to auth changes
        authChangeUnsubscribe = pb.authStore.onChange(handleAuthChange);

        // Also listen for message events from the popup (if it can communicate)
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          console.log('Received message from popup:', event.data);

          if (event.data?.type === 'oauth2-success') {
            console.log('Google OAuth successful - message received');
            cleanup();
            window.removeEventListener('message', handleMessage);
            resolve(pb.authStore.model);
          } else if (event.data?.type === 'oauth2-error') {
            console.log('Google OAuth error - message received:', event.data.error);
            cleanup();
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.error || 'OAuth failed'));
          } else if (event.data?.type === 'oauth2-debug') {
            console.log('OAuth2 Debug:', event.data.message, event.data.url || '');
          }
        };

        window.addEventListener('message', handleMessage);

        // Set timeout for OAuth process
        timeoutId = setTimeout(() => {
          console.log('OAuth timeout reached (2 minutes)');
          cleanup();
          window.removeEventListener('message', handleMessage);

          // Final check before timing out
          if (pb.authStore.isValid) {
            resolve(pb.authStore.model);
          } else {
            reject(new Error('Google OAuth timeout - please try again'));
          }
        }, 120000); // 2 minutes timeout
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