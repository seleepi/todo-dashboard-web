# TODO Dashboard

A personalized dashboard application where users can place various widgets including TODO lists, time, weather, and YouTube player widgets.

## Quick Start

### 1. Start PocketBase Backend
Navigate to the pocketbase directory and start the server:
```bash
cd pocketbase
./pocketbase serve
```
- PocketBase will run at: http://127.0.0.1:8090
- Admin panel: http://127.0.0.1:8090/_/

### 2. Start Next.js Frontend
Navigate to the project directory and start the development server:
```bash
npm run dev
```
- App will run at: http://localhost:3000

## Testing PocketBase Connection

1. **Check if PocketBase is running**: Open http://127.0.0.1:8090/_/ in your browser
2. **Create admin account** when prompted
3. **Follow database setup**: See `pocketbase-setup.md` for creating collections

## Application Workflow

### User Flow
1. **Login**: Use `test@gmail.com` / `12345678` to log in
2. **Dashboard Selection**: Choose from available dashboards (e.g., "내 첫 대시보드")
3. **Widget Management**: Add/remove/move widgets on the dashboard
4. **Real-time Sync**: All changes instantly sync across tabs and users
5. **Multi-tab Support**: Open same dashboard in multiple tabs - changes appear instantly
6. **Admin Panel Integration**: Changes made in PocketBase admin panel appear in real-time

### Data Flow
1. **Authentication**: PocketBase handles user authentication
2. **Dashboard Loading**: Load dashboard list from PocketBase after login
3. **Widget Loading**: Load widgets for selected dashboard
4. **Real-time Subscriptions**: Subscribe to widget changes for live updates
5. **Bi-directional Sync**: 
   - **Web → Database**: Widget changes instantly saved to PocketBase
   - **Database → Web**: Changes from admin panel/other tabs instantly reflected
6. **State Management**: Local React state + PocketBase persistence + real-time sync

## Debug & Troubleshooting

### Common Issues
1. **Login fails**: Verify PocketBase is running on port 8090
2. **No dashboards**: Check collections are created in PocketBase admin panel
3. **Widgets not saving**: Check browser console for PocketBase errors
4. **Real-time not working**: Check console for subscription errors
5. **App not loading**: Verify Next.js dev server is running on port 3000

### Debug Steps
1. **Check PocketBase logs**: Look at terminal running `./pocketbase serve`
2. **Browser console**: Check for JavaScript/API errors and 'Real-time event:' logs
3. **Network tab**: Verify API calls to http://127.0.0.1:8090
4. **PocketBase admin**: Check data in collections via admin panel
5. **Multi-tab test**: Open dashboard in two tabs, make changes, verify real-time sync

### Useful Debug URLs
- Frontend: http://localhost:3000
- PocketBase API: http://127.0.0.1:8090
- PocketBase Admin: http://127.0.0.1:8090/_/

## Deployment to Railway

### Prerequisites
1. Railway account: https://railway.app/
2. GitHub repo connected: https://github.com/seleepi/todo-dashboard-web

### Step 1: Deploy PocketBase Backend
1. In Railway dashboard, create new project
2. Choose "Deploy from GitHub repo"
3. Select your repo
4. **Important**: Set build command to use PocketBase Dockerfile:
   - Build Command: `docker build -f Dockerfile.pocketbase -t pocketbase .`
   - Start Command: `./pocketbase serve --http=0.0.0.0:$PORT`
5. Railway will assign a URL like `https://your-app.railway.app`

### Step 2: Deploy Next.js Frontend
1. Create another Railway service in same project
2. Connect same GitHub repo
3. Railway auto-detects Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_POCKETBASE_URL` = `https://your-pocketbase-app.railway.app`
5. Deploy!

### Step 3: Configure Database
1. Access your PocketBase admin at `https://your-pocketbase-app.railway.app/_/`
2. Create admin account
3. Follow `pocketbase-setup.md` to create collections
4. Your app will be live at `https://your-frontend-app.railway.app`

### Production URLs (after deployment)
- Frontend: `https://your-frontend.railway.app`
- Backend: `https://your-pocketbase.railway.app`
- Admin Panel: `https://your-pocketbase.railway.app/_/`

## Features

### Core Functionality
- **User Authentication**: Registration and login for private dashboard users
- **Persistent Layout**: Dashboard restores previously placed widgets and their content on restart
- **Widget Management**: Add, remove, and manage various widget types
- **Drag & Drop**: Move widgets around the dashboard
- **Resizable Widgets**: Adjust widget sizes
- **Collapsible Widgets**: Minimize widgets when not in use

### Widget Types
- **TODO Lists**: Full functionality including checkboxes, reordering, text editing
- **Text Fields**: Text and photo content only
- **Clock & Weather Widget**: Combined widget displaying current time and weather information
- **YouTube Widget**: Generate YouTube player when user provides a YouTube link

### Settings
- **Background Customization**: Change dashboard background
- **Style Customization**: Adjust styles for widgets, clock, and text

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: PocketBase for data storage and authentication
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth integration
- **Deployment**: Railway

## Project Structure

```
todo-dashboard/
├── src/
│   ├── components/
│   │   ├── widgets/
│   │   ├── auth/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── public/
├── pocketbase/
└── docs/
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PocketBase

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd todo-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up PocketBase
```bash
# Download and run PocketBase
# Setup will be documented in setup phase
```

4. Configure environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. Run the development server
```bash
npm run dev
```

## Development Roadmap

### Phase 1: Foundation
- [x] Project setup with Next.js and TypeScript
- [x] PocketBase backend setup
- [x] Basic authentication system
- [x] Dashboard layout foundation

### Phase 2: Core Widgets
- [x] TODO list widget implementation
- [x] Clock & Weather combined widget
- [x] Text field widget (text and photos)
- [x] YouTube widget with link-to-player functionality

### Phase 3: Enhancement
- [x] Drag & drop functionality
- [x] Widget resizing
- [ ] Settings page
- [ ] Background customization

### Phase 4: Polish
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Testing
- [ ] Documentation

## Contributing

This is a personal project for Web Development coursework.

## License

This project is for educational purposes.

## Deadline

Target completion: October 15, 2025

## Development Workflow

### Phase 1: Foundation - ✅ COMPLETED
**Date**: August 20, 2025

#### 1. Project Setup
- [x] Created Next.js project with TypeScript, Tailwind CSS, ESLint
- [x] Set up project folder structure (`components/`, `hooks/`, `types/`, `utils/`)
- [x] Configured absolute imports with `@/*` alias

#### 2. Type System & Architecture
- [x] Created comprehensive widget type definitions (`types/widget.ts`)
  - Widget interface with position, size, data, and collapse state
  - WidgetType enum for all widget types
  - Specific data interfaces for each widget type
  - DashboardState interface

#### 3. Core Dashboard Layout
- [x] Built main Dashboard component (`components/layout/Dashboard.tsx`)
  - State management for widgets and background
  - Add/remove/update widget functionality
  - Responsive layout with header and main content
  - Empty state handling
- [x] Created AddWidgetButton component with dropdown menu
  - All 4 widget types with descriptions
  - Clean UI with backdrop click-to-close

#### 4. Widget System Foundation
- [x] Built WidgetComponent wrapper (`components/widgets/WidgetComponent.tsx`)
  - Dynamic widget rendering based on type
  - Header with title, collapse/expand, and remove buttons
  - Hover state interactions
  - Absolute positioning system

#### 5. Individual Widget Implementations
- [x] **TODO Widget** (`components/widgets/TodoWidget.tsx`)
  - Add new tasks with Enter key support
  - Check/uncheck tasks with visual feedback
  - Remove tasks with confirmation
  - Empty state handling
  - Persistent task state

- [x] **Text Widget** (`components/widgets/TextWidget.tsx`)
  - Click-to-edit text functionality
  - Save/cancel editing modes
  - Multiline text support with proper formatting
  - Empty state with click prompt

- [x] **Clock & Weather Widget** (`components/widgets/ClockWeatherWidget.tsx`)
  - Real-time clock updating every second
  - Date display with full formatting
  - Editable location with inline editing
  - Mock weather data with emoji icons
  - Clean combined layout

- [x] **YouTube Widget** (`components/widgets/YouTubeWidget.tsx`)
  - URL validation and video ID extraction
  - Embedded YouTube iframe player
  - Add/remove video functionality
  - URL input with Enter key support
  - Error handling for invalid URLs

#### 6. Integration & Testing
- [x] Updated main page (`app/page.tsx`) to use Dashboard
- [x] Fixed ESLint quote escaping error in Dashboard component
- [x] Confirmed TypeScript compilation passes
- [x] Started development server successfully (http://localhost:3000)
- [x] Debugged browser connection issues (solved with 127.0.0.1:3000)
- [x] Verified all widget functionality in browser

#### 7. UI/UX Debugging & Fixes
- [x] Fixed header/widget overlapping issues
  - Changed header to `fixed` positioning with `z-50`
  - Increased main content padding to `pt-24`
  - Set widget z-index to `z-10` with minimum top position
- [x] Fixed widget stacking issues
  - Implemented responsive grid layout system
  - Widgets arrange in rows based on screen width
  - Proper 20px spacing between widgets
  - Natural scrolling for overflow

#### 8. Grid System Implementation
- [x] Implemented invisible snap-to-grid system (0.5cm ≈ 19px grid units)
- [x] Widget positioning snaps to grid intersections
- [x] Widget sizing constrained to grid multiples with presets:
  - Clock/Weather: 12x8 units (small)
  - TODO/Text: 16x11 units (medium) 
  - YouTube: 20x14 units (large)
- [x] Grid debug overlay with toggle button
- [x] Clean alignment like design tools (Figma/Sketch)

#### 9. Advanced Widget Interactions
- [x] Implemented widget resize functionality
  - Resize handles on corners and edges
  - Grid-snapped sizing with minimum constraints
  - Visual feedback during resize
- [x] **MAJOR DEBUG SESSION**: Drag & Drop Issues
  - **Problem 1**: Mouse offset causing widget "jumping" on pickup
  - **Problem 2**: Widgets becoming undraggable after first use
  - **Root Cause Analysis**: 
    - Excessive re-renders (60+ per drag) breaking event listeners
    - Coordinate system mismatch (screen vs logical coordinates)
    - Header detection failing after widget position changes
  - **Solution**: 
    - Stable event handlers with proper cleanup
    - Delta-based movement calculations
    - Absolute header bounds checking with `data-widget-header`
  - **Result**: Perfect infinite drag & drop with no jumping ✅

#### 10. Backend Integration Setup
- [x] Downloaded and configured PocketBase v0.22.21
  - Extracted to `/pocketbase/` directory
  - Server running on http://127.0.0.1:8090
  - Admin UI available at http://127.0.0.1:8090/_/
- [x] Installed PocketBase JavaScript SDK
- [x] Created comprehensive PocketBase client utilities (`lib/pocketbase.ts`)
  - Authentication helpers (signUp, signIn, signOut, getCurrentUser)
  - Dashboard management (CRUD operations)
  - Widget management (CRUD + batch updates)
  - Real-time subscription helpers
- [x] Environment configuration setup
  - `.env.local` for PocketBase URL configuration
  - `.env.local.example` template for deployment
- [x] Created PocketBase setup documentation (`pocketbase-setup.md`)
  - Database schema design for Users, Dashboards, Widgets collections
  - API security rules for user data isolation
  - Step-by-step admin panel configuration guide

### Future Work: Complete Backend Integration

#### Phase A: Database Schema Setup
- [ ] Create admin account in PocketBase admin panel
- [ ] Configure Users collection (verify auth fields)
- [ ] Create Dashboards collection with user relations
- [ ] Create Widgets collection with dashboard relations
- [ ] Set up API security rules for data isolation
- [ ] Test collections with sample data

#### Phase B: Frontend Integration
- [ ] Create authentication UI components (login/signup forms)
- [ ] Implement dashboard persistence (save/load dashboard state)
- [ ] Add real-time synchronization for collaborative editing
- [ ] Handle offline/online state management
- [ ] Add data validation and error handling

#### Phase C: Enhanced Features
- [ ] Weather API integration for live weather data
- [ ] Photo upload functionality for text widgets
- [ ] Google OAuth integration
- [ ] Dashboard sharing and templates
- [ ] Export/import dashboard functionality

### Future Enhancements
- [ ] Mobile responsive optimizations
- [ ] Keyboard shortcuts and accessibility
- [ ] Advanced grid customization options
- [ ] Widget marketplace/plugins system
- [ ] Performance optimizations for large dashboards
- [ ] PWA features (offline support, app installation)
