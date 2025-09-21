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
1. **Authentication**:
   - **Google OAuth**: One-click login with Google account (automatic user registration)
   - **Test Account**: Use `test@gmail.com` / `12345678` for manual login
   - **Secure Access**: Each user gets isolated PocketBase environment

2. **Dashboard Management**:
   - **First Time**: No dashboards available - create your first dashboard
   - **Dashboard Creation**: Click "새 대시보드 만들기" → Enter name → Auto-navigate to new dashboard
   - **Dashboard Navigation**: Use hamburger menu (≡) to switch between dashboards
   - **Sidebar Features**: Create, select, and manage multiple dashboards from slide-out menu

3. **Widget Management**:
   - **Add Widgets**: Click "Add Widget" → Choose type (TODO, Text, Clock/Weather, YouTube)
   - **Drag & Drop**: Move widgets around with mouse drag
   - **Resize**: Drag corner/edge handles to resize widgets
   - **Edit Content**: Click widgets to edit (text, tasks, YouTube URLs)
   - **Collapse/Remove**: Use widget header buttons

4. **Real-time Collaboration**:
   - **Multi-tab Support**: Open same dashboard in multiple tabs - changes appear instantly
   - **Live Sync**: All changes automatically saved and synced across sessions
   - **Admin Panel Integration**: Changes from PocketBase admin panel reflect in real-time

### Data Flow
1. **Authentication**:
   - Google OAuth 2.0 + PKCE flow for secure login
   - PocketBase handles user management and session tokens
   - Each user gets private data space (admin cannot access user data)

2. **Dashboard State Management**:
   - **Dashboard Selection**: Load user's dashboard list from PocketBase
   - **Dashboard Switching**: Sidebar navigation with React key-based remounting
   - **State Isolation**: Each dashboard maintains independent widget state

3. **Widget Persistence**:
   - **Local State**: React useState for immediate UI updates
   - **Database Sync**: Automatic save to PocketBase on every change
   - **Real-time Updates**: PocketBase subscriptions for live collaboration

4. **Memory Management**:
   - **Subscription Cleanup**: Automatic cleanup when switching dashboards
   - **Component Lifecycle**: Safe state updates with mount tracking
   - **Performance**: React.memo and useCallback for optimized rendering

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
4. Your app will be live at `https://todo-dashboard.up.railway.app`

### Production URLs
- Frontend: `https://todo-dashboard.up.railway.app`
- Backend: `https://your-pocketbase-service.railway.app` (check Railway dashboard)
- Admin Panel: `https://your-pocketbase-service.railway.app/_/`

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

#### 11. Railway Deployment - ✅ COMPLETED
**Date**: August 24, 2025

- [x] **PocketBase Railway Deployment Configuration**
  - Created `Dockerfile.pocketbase` for containerized PocketBase deployment
  - Added Railway configuration with proper port binding and start commands
  - Configured PocketBase to serve on Railway's dynamic port assignment
  - Set up database and migrations copying for persistent data
- [x] **Dual Service Railway Setup**
  - Frontend service: Auto-detected Next.js deployment
  - Backend service: Custom Dockerfile-based PocketBase deployment
  - Both services deployed from same GitHub repository
  - No root directory configuration needed
- [x] **Live Production Deployment**
  - Frontend successfully deployed: `https://todo-dashboard.up.railway.app`
  - Backend service deployed with PocketBase
  - Custom domain configuration tested (opted for Railway subdomain)
  - Production environment fully operational

#### 12. Railway Deployment Issues - ⚠️ IN PROGRESS
**Date**: August 24, 2025

**Problem Identified**: Single repository with dual service deployment configuration conflicts

- **Issue**: PocketBase service (`pocketbase-todo-dashboard.up.railway.app`) serving Next.js frontend instead of PocketBase
- **Root Cause**: `railway.json` with NIXPACKS builder affecting both services
- **Attempted Solutions**:
  - Custom Build Command with Docker: Failed (Docker not available in NIXPACKS build environment)
  - Build Command Tried: `docker build -f Dockerfile.pocketbase -t pocketbase . && docker run -p $PORT:$PORT pocketbase ./pocketbase serve --http=0.0.0.0:$PORT`
  - Error: `/bin/bash: line 1: docker: command not found`

**Current Status**:
- Frontend: ✅ Working at `https://todo-dashboard.up.railway.app`
- Backend: ❌ Serving wrong application (Next.js instead of PocketBase)
- Admin Panel: ❌ Not accessible at `https://pocketbase-todo-dashboard.up.railway.app/_/`

**Technical Analysis**:
- Railway's NIXPACKS builder doesn't support nested Docker builds
- Single `railway.json` configuration applies to both services
- Cannot override start command when using `railway.json`
- Service-specific configuration requires separate repositories or different approach

### Future Work: Complete Backend Integration

#### Phase A: Fix Railway Deployment Architecture
**Priority: HIGH**
- [ ] **Option 1: Separate Repositories**
  - Create separate GitHub repository for PocketBase backend
  - Deploy PocketBase service from dedicated backend repo
  - Keep frontend in current repository
  - Configure cross-origin resource sharing (CORS)

- [ ] **Option 2: Railway Service Reconfiguration**
  - Remove `railway.json` and use Railway dashboard manual configuration
  - Set PocketBase service to use Dockerfile builder manually
  - Configure start command through Railway dashboard only
  - Test service isolation

- [ ] **Option 3: Monorepo with Service Detection**
  - Restructure repository with separate `frontend/` and `backend/` directories
  - Use Railway's root directory configuration for service targeting
  - Create service-specific configuration files

#### Phase B: Database Schema Setup (After Backend Fix)
- [ ] Create admin account in PocketBase admin panel
- [ ] Configure Users collection (verify auth fields)
- [ ] Create Dashboards collection with user relations
- [ ] Create Widgets collection with dashboard relations
- [ ] Set up API security rules for data isolation
- [ ] Test collections with sample data
- [ ] Create test user account (`test@gmail.com` / `12345678`)

#### Phase C: Frontend Integration
- [ ] Configure frontend environment variable (`NEXT_PUBLIC_POCKETBASE_URL`)
- [ ] Create authentication UI components (login/signup forms)
- [ ] Implement dashboard persistence (save/load dashboard state)
- [ ] Add real-time synchronization for collaborative editing
- [ ] Handle offline/online state management
- [ ] Add data validation and error handling

#### Phase D: Enhanced Features
- [ ] Weather API integration for live weather data
- [ ] Photo upload functionality for text widgets
- [ ] Google OAuth integration
- [ ] Dashboard sharing and templates
- [ ] Export/import dashboard functionality

## Current Deployment URLs

### Working
- **Frontend**: `https://todo-dashboard.up.railway.app` ✅

### Working ✅
- **Backend**: `https://todo-dashboard-pocketbase.up.railway.app` ✅ (PocketBase API)
- **Admin Panel**: `https://todo-dashboard-pocketbase.up.railway.app/_/` ✅ (accessible)

### Railway Deployment Problem Analysis & Solutions

#### What's Actually Happening
**"PocketBase service running Next.js instead of PocketBase"** means:
- You have **2 Railway services** from the same repo
- **Service 1** (frontend): Should run Next.js ✅ - working correctly 
- **Service 2** (backend): Should run PocketBase ❌ - but it's also running Next.js

Both services are building and running the **same Next.js app** instead of different applications.

**"NIXPACKS doesn't support Docker"** means:
- Railway's default builder (NIXPACKS) auto-detects your project type
- It saw Next.js files and built Next.js for both services
- When you tried Docker commands to build PocketBase, NIXPACKS environment doesn't have Docker installed
- So the command `docker build -f Dockerfile.pocketbase` failed

#### Solution Options

**Option 1: Fix Railway Configuration (RECOMMENDED)**
- Keep single repo 
- Configure Railway services manually (not auto-detection)
- Set backend service to use Dockerfile builder
- Much simpler than separate repos

**Option 2: Separate Repositories**
- Create separate GitHub repos for frontend/backend
- Each has its own `railway.json`
- More complex to maintain, sync changes

**Option 3: Change Platform**
- Railway is actually good - the issue is configuration, not Railway
- Other platforms (Vercel, Render, Fly.io) would have similar issues with single-repo dual-service setup

#### Recommended Fix Steps
1. **Remove conflicting `railway.json`** 
2. **Manually configure backend service** in Railway dashboard to use Dockerfile
3. **Set correct start commands** for each service

#### Railway Deployment Debug Workflow - COMPLETED ✅
**Date**: August 28, 2025

### Problems Encountered & Root Causes

#### Problem 1: Both Services Running Next.js ❌
**Symptom**: Backend service at `pocketbase-todo-dashboard.up.railway.app` served Next.js frontend instead of PocketBase API

**Root Cause**: Single `railway.json` with NIXPACKS builder applied to both services
- Railway auto-detected Next.js and built it for both frontend and backend services
- Single repository with dual services caused configuration conflicts

**Our Mistake**: Using single configuration file for multiple services with different requirements

#### Problem 2: 502 Bad Gateway Errors ❌
**Symptom**: Both frontend and backend services showed 502 errors after attempting fixes

**Root Cause**: Conflicting Railway configurations
- `railway.json` and Railway dashboard settings conflicting
- Both services trying to use same build configuration

**Our Mistake**: Not understanding Railway's service isolation requirements

#### Problem 3: PORT Variable Not Expanding ❌
**Symptom**: PocketBase logs showed literal `$PORT` instead of actual port number
```
Error: listen tcp: lookup tcp/$PORT: unknown port
```

**Root Cause**: Multiple configuration conflicts
1. **Dockerfile CMD exec form** doesn't expand environment variables
2. **railway.json startCommand** conflicting with Dockerfile CMD
3. Railway was executing startCommand instead of Dockerfile CMD

**Our Mistakes**: 
- Using Docker exec form `CMD ["command"]` instead of shell form for variable expansion
- Having conflicting commands in both railway.json and Dockerfile
- Not understanding Railway's command precedence (railway.json overrides Dockerfile)

### Solution Workflow - What Finally Worked ✅

#### Step 1: Separate Repositories Approach
**Action**: Created separate GitHub repository for PocketBase backend
- **Frontend repo**: `seleepi/todo-dashboard-web` (Next.js only)  
- **Backend repo**: `seleepi/todo-dashboard-pocketbase` (PocketBase only)

**Result**: Clean separation, no configuration conflicts

#### Step 2: Fixed Railway Service Configuration
**Action**: 
- Deleted old Railway backend service
- Created new Railway service connected to PocketBase-only repository
- Railway correctly detected single-purpose repository

#### Step 3: Resolved PORT Variable Issues
**Final working configuration**:

**Dockerfile.pocketbase**:
```dockerfile
# Use exec form with hardcoded port
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
```

**railway.json**:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.pocketbase"
  },
  "deploy": {
    // NO startCommand - let Dockerfile handle it
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Key Insights**:
- **Remove railway.json startCommand** - it overrides Dockerfile CMD
- **Use hardcoded port 8080** - Railway handles external routing automatically
- **Don't mix shell and exec forms** - stick to exec form for consistency

### Debug Methodology That Worked

1. **Isolate the Problem**: Separate repositories eliminated configuration conflicts
2. **Simplify Configuration**: Remove all complex variable handling, use hardcoded values
3. **Single Source of Truth**: Either railway.json OR Dockerfile handles startup, not both
4. **Test Incrementally**: Each change tested immediately with Railway logs
5. **Read Error Messages Carefully**: `lookup tcp/$PORT` clearly showed variable wasn't expanding

### Production URLs - Final Working State ✅
- **Frontend**: `https://todo-dashboard.up.railway.app` (Next.js)
- **Backend API**: `https://todo-dashboard-pocketbase.up.railway.app` (PocketBase)
- **Admin Panel**: `https://todo-dashboard-pocketbase.up.railway.app/_/` (PocketBase Admin)

### Lessons Learned
1. **Single-repo dual-service deployment is complex** - separate repos are simpler
2. **Railway configuration precedence**: railway.json startCommand > Dockerfile CMD
3. **Environment variable expansion**: Use shell form CMD or hardcode values
4. **Railway auto-routing**: Internal port 8080 → external HTTPS automatically
5. **Debug systematically**: Isolate problems, test incremental changes

#### Step 4: Environment Variables and Final Configuration - ✅ COMPLETED
**Date**: August 28, 2025

**Final Issue**: Frontend environment configuration for production PocketBase connection

### Database Persistence Problem & Solution

#### Problem 4: Database Wiped on Every Deployment ❌
**Symptom**: Admin account and data disappeared after each Railway deployment
**Root Cause**: Railway containers are stateless - SQLite database stored in container filesystem gets reset
**Solution**: Added persistent storage initialization script in Dockerfile

#### Problem 5: Frontend Connecting to Localhost Instead of Production ❌  
**Symptom**: Frontend login failed because it was trying to connect to `http://127.0.0.1:8090` instead of production PocketBase
**Root Cause**: Missing `NEXT_PUBLIC_POCKETBASE_URL` environment variable in Railway frontend service
**Solution**: Added environment variable in Railway Dashboard

### Final Working Configuration - August 28, 2025 ✅

#### Railway Services Setup
- **Frontend Service**: `todo-dashboard.up.railway.app`
  - Repository: `seleepi/todo-dashboard-web` (Next.js only)
  - Environment Variables: `NEXT_PUBLIC_POCKETBASE_URL=https://todo-dashboard-pocketbase.up.railway.app`
  - Auto-deployment with NIXPACKS
  
- **Backend Service**: `todo-dashboard-pocketbase.up.railway.app`  
  - Repository: `seleepi/todo-dashboard-pocketbase` (PocketBase only)
  - Dockerfile-based deployment with persistent storage initialization
  - No environment variables needed

#### Database Collections
- **users**: Authentication collection (default PocketBase auth)
- **dashboards**: User dashboard instances with relations
- **widgets**: Individual widgets with position, size, and data
- API rules configured for user data isolation

#### Environment Variable Configuration Process
1. **Railway Dashboard → Frontend Service → Variables**
2. **Add Variable**: 
   - Name: `NEXT_PUBLIC_POCKETBASE_URL`
   - Value: `https://todo-dashboard-pocketbase.up.railway.app`
3. **Save & Redeploy**

### Current Status - END OF SESSION ✅

#### What's Working Perfectly
- **Frontend Application**: `https://todo-dashboard.up.railway.app` ✅
  - User authentication working with test@gmail.com / 12345678
  - Dashboard creation and management  
  - Widget creation, positioning, and resizing
  - Real-time data persistence to PocketBase
  - All widget types functional (TODO, Text, Clock/Weather, YouTube)
  
- **Backend API**: `https://todo-dashboard-pocketbase.up.railway.app` ✅
  - PocketBase server running successfully
  - Database collections properly configured
  - API endpoints responding correctly
  - Data persistence working (widgets, dashboards saved)

#### Current Issue - LOW PRIORITY ⚠️
- **Admin Panel Access**: `https://todo-dashboard-pocketbase.up.railway.app/_/`
  - Cannot login to PocketBase admin panel
  - "Invalid login credentials" error
  - Password recovery email not working
  - **NOTE**: This doesn't affect application functionality - frontend works perfectly

### Session Continuation Notes

#### Completed Successfully ✅
1. ✅ Railway dual-service deployment architecture
2. ✅ Dockerfile configuration with persistent storage
3. ✅ Environment variable configuration
4. ✅ Database collections setup
5. ✅ Frontend-backend integration
6. ✅ User authentication and data persistence
7. ✅ All core application features working

#### Next Session Tasks (Optional Improvements)
- [ ] **Debug admin panel login** (low priority - app works without it)
- [ ] **Railway volume mounting** for true database persistence across deployments  
- [ ] **Production user testing** and dashboard templates
- [ ] **Performance optimizations** and mobile responsiveness

#### Debug Commands for Next Session
```bash
# Test PocketBase API connectivity
curl -s https://todo-dashboard-pocketbase.up.railway.app/api/health

# Test user authentication
curl -X POST https://todo-dashboard-pocketbase.up.railway.app/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"test@gmail.com","password":"12345678"}'

# Check frontend environment in browser console
console.log(process.env.NEXT_PUBLIC_POCKETBASE_URL)
```

### Final Deployment Success Summary
**Deployment Architecture**: ✅ Separate repositories approach successful
**Application Functionality**: ✅ All features working in production  
**Data Persistence**: ✅ User data and widgets saving properly
**Authentication**: ✅ User login and dashboard access working
**Real-time Updates**: ✅ Changes sync across sessions

**🎉 TODO Dashboard successfully deployed and fully functional!**

### Session: PocketBase Configuration & Persistence Fix - ✅ COMPLETED
**Date**: September 19, 2025

#### Problems Identified & Root Causes

##### Problem 1: Admin Account Disappearing After Restarts ❌
**Symptom**: Admin login credentials became invalid after each Railway deployment restart
- Could not access PocketBase admin panel at `/_/`
- "Invalid login credentials" error for existing accounts
- "Create first admin" option disappeared

**Root Cause Analysis**:
- **Missing Volume Configuration**: No persistent storage for `/pb/pb_data` directory
- **Docker VOLUME Declaration**: Used `VOLUME ["/pb/pb_data"]` which Railway prohibits
- **Container Restarts**: SQLite database stored in ephemeral container filesystem

##### Problem 2: Configuration Structure Complexity ❌  
**Symptom**: Duplicate and conflicting PocketBase configurations
- Two separate directories: `pocketbase/` and `pocketbase-railway/`
- Nested migration folders: `pocketbase/pb_migrations/pb_migrations/`
- Unsynchronized migration files between directories
- Deployment targeting wrong service (Node.js instead of PocketBase)

**Root Cause**: Legacy dual-structure from previous deployment attempts

#### Solution Implementation Process

##### Step 1: Structure Cleanup ✅
```bash
# Remove nested migration folders
rmdir pocketbase/pb_migrations/pb_migrations/

# Remove temporary test files  
rm pocketbase-railway/pb_migrations/1726732800_create_admin.js

# Consolidate to single structure
cp pocketbase-railway/Dockerfile pocketbase/
cp pocketbase-railway/railway.json pocketbase/
rm -rf pocketbase-railway/
```

##### Step 2: Railway Volume Configuration ✅
**Railway Dashboard Process**:
1. **Command Palette** (`Ctrl+K` or `⌘K`) → "Create Volume"
2. **Service Selection**: `todo-dashboard-pocketbase`  
3. **Mount Path**: `/pb/pb_data`
4. **Size**: 1GB persistent storage

**Key Discovery**: Railway Volume settings located in Command Palette, not Settings tab

##### Step 3: Dockerfile Compliance ✅
**Problem**: Railway prohibits `VOLUME` keyword in Dockerfiles
```dockerfile
# ❌ BEFORE - Caused deployment failure
VOLUME ["/pb/pb_data"]

# ✅ AFTER - Railway compliant
RUN mkdir -p /pb/pb_data
# Railway volumes handle persistence automatically
```

##### Step 4: Build Path Corrections ✅
**Problem**: Docker COPY command with shell redirection failed
```dockerfile  
# ❌ BEFORE - Docker doesn't support shell redirection
COPY pb_migrations/ ./pb_migrations/ 2>/dev/null || true

# ✅ AFTER - Correct path from repository root
COPY pocketbase/pb_migrations/ ./pb_migrations/
```

##### Step 5: Service Deployment Fix ✅
**Problem**: PocketBase code deployed to Node.js service (wrong service)
- Build logs showed `npm run build` instead of Alpine Linux + PocketBase
- Root cause: `package.json` in repository root caused Railway to detect Node.js

**Solution**: Replace root Dockerfile with PocketBase version
```bash
cp pocketbase/Dockerfile ./Dockerfile  # Override Node.js detection
railway up  # Deploy to correct service with Docker build
```

#### Persistence Verification Process ✅

##### Test Sequence
1. **Admin Account Creation**: Created new admin account in fresh deployment
2. **Service Restart**: Triggered deployment restart via `railway up`  
3. **Persistence Verification**: Admin account retained after restart
4. **Collections Verification**: `users`, `dashboards`, `widgets` collections preserved
5. **Data Integrity**: All schema and migrations properly applied

##### Technical Validation
- **Volume Mount**: Railway successfully mounted `/pb/pb_data` 
- **SQLite Persistence**: Database file survives container restarts
- **Migration Replay**: Schema recreated correctly on fresh deploys
- **Admin Authentication**: Login credentials preserved across restarts

#### Final Configuration State ✅

##### Railway Volume Setup
- **Mount Path**: `/pb/pb_data` (PocketBase data directory)
- **Service**: `todo-dashboard-pocketbase`  
- **Size**: 1GB persistent storage
- **Mount Type**: Railway managed volume

##### Dockerfile Configuration
```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /pb
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip /tmp/pocketbase.zip
RUN cd /tmp && unzip pocketbase.zip && chmod +x pocketbase && mv pocketbase /pb/
COPY pocketbase/pb_migrations/ ./pb_migrations/
RUN mkdir -p /pb/pb_data  # Railway volumes handle persistence
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
```

##### Railway Configuration
```json
{
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { 
    "startCommand": "/pb/pocketbase serve --http=0.0.0.0:8080",
    "restartPolicyType": "NEVER",  // Prevent unnecessary restarts
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

#### Web Application Integration ✅

##### Environment Configuration
**Local Development**:
```bash
# .env.local created
NEXT_PUBLIC_POCKETBASE_URL=https://todo-dashboard-pocketbase.up.railway.app
```

**Railway Frontend Service**:
- Environment Variable: `NEXT_PUBLIC_POCKETBASE_URL`
- Value: Production PocketBase URL
- Auto-connection to deployed backend

#### Deployment Verification Results ✅

##### Production URLs Working
- **PocketBase API**: `https://todo-dashboard-pocketbase.up.railway.app` ✅
- **Admin Panel**: `https://todo-dashboard-pocketbase.up.railway.app/_/` ✅  
- **Health Check**: `{"message":"API is healthy.","code":200,"data":{"canBackup":true}}` ✅

##### Persistence Testing Results  
- **Admin Login**: ✅ Successful after restart
- **Collections**: ✅ All schema preserved (`users`, `dashboards`, `widgets`)
- **Data Integrity**: ✅ Migration files properly applied
- **Volume Mounting**: ✅ `/pb/pb_data` successfully persisted

#### Problem Resolution Summary

| Issue | Root Cause | Solution | Status |
|-------|------------|----------|--------|
| Admin disappearing | No persistent volume | Railway Volume + mount `/pb/pb_data` | ✅ Resolved |
| Duplicate configs | Legacy structure | Consolidate to `pocketbase/` only | ✅ Resolved |  
| Wrong service deploy | Node.js detection | Replace root Dockerfile | ✅ Resolved |
| Docker VOLUME error | Railway prohibition | Remove VOLUME keyword | ✅ Resolved |
| Build path errors | Shell redirection | Fix COPY paths | ✅ Resolved |

#### Key Technical Learnings
1. **Railway Volumes**: Created via Command Palette, not Settings tab
2. **Railway Restrictions**: `VOLUME` keyword prohibited in Dockerfiles  
3. **Service Detection**: Root `package.json` causes Node.js detection override
4. **Volume Persistence**: Railway handles mounting automatically after creation
5. **Restart Policies**: Use "NEVER" to prevent unnecessary admin account resets

### Next Session Priority (Optional)
1. ~~Investigate PocketBase admin panel login issue~~ ✅ **RESOLVED**
2. ~~Implement Railway volume mounting for database persistence~~ ✅ **COMPLETED** 
3. Add production user management features
4. Performance and mobile optimizations

### Session: Google OAuth Authentication - ✅ COMPLETED
**Date**: September 20-21, 2025

#### Implementation Overview
Implemented Google OAuth 2.0 + PKCE authentication for user self-registration, replacing manual admin user creation.

#### Final Architecture
- **Authentication Flow**: Google OAuth → Next.js redirect handler → PocketBase API → Dashboard access
- **Security**: PKCE (Proof Key for Code Exchange) + state verification
- **User Experience**: One-click Google login with automatic account creation

#### Key Components

##### 1. OAuth Service (`lib/pocketbase.ts`)
```javascript
async signInWithGoogle() {
  // Get OAuth provider from PocketBase
  const authMethods = await fetch(`${pb.baseUrl}/api/collections/users/auth-methods`);
  const googleProvider = authMethods.authProviders.find(p => p.name === 'google');

  // Store PKCE credentials
  sessionStorage.setItem('oauth_code_verifier', googleProvider.codeVerifier);
  sessionStorage.setItem('oauth_state', googleProvider.state);

  // Fix redirect URI to Next.js app
  const url = new URL(googleProvider.authUrl);
  url.searchParams.set('redirect_uri', `${window.location.origin}/oauth2-redirect`);

  // Open popup and listen for completion
  const popup = window.open(url.toString());
  return new Promise((resolve, reject) => {
    pb.authStore.onChange(() => resolve(pb.authStore.model));
    window.addEventListener('message', handleOAuthMessages);
  });
}
```

##### 2. OAuth Redirect Handler (`app/oauth2-redirect/page.tsx`)
```javascript
// Get authorization code from URL
const code = new URLSearchParams(window.location.search).get('code');
const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier');

// Complete OAuth flow with PocketBase
const authResponse = await fetch(`${pb.baseUrl}/api/collections/users/auth-with-oauth2`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google',
    code: code,
    codeVerifier: storedCodeVerifier,
    redirectUrl: window.location.href.split('?')[0]
  })
});

// Update auth store and close popup
const authData = await authResponse.json();
pb.authStore.save(authData.token, authData.record);
window.close();
```

#### Google Cloud Console Configuration
```
Authorized JavaScript origins:
- https://todo-dashboard.up.railway.app

Authorized redirect URIs:
- https://todo-dashboard.up.railway.app/oauth2-redirect
```

#### Environment Configuration
```bash
# Railway Frontend Service
NEXT_PUBLIC_POCKETBASE_URL=https://todo-dashboard-pocketbase.up.railway.app
```

#### Authentication Flow
1. User clicks "Google로 로그인" button
2. Popup opens with Google account selection
3. User authorizes application access
4. Google redirects to `/oauth2-redirect` with authorization code
5. PocketBase processes OAuth and creates/authenticates user
6. User gains immediate dashboard access

#### Production Status ✅
- **User Registration**: Automatic via Google OAuth
- **Authentication**: Seamless Google account integration
- **Security**: PKCE + state verification implemented
- **Deployment**: Fully operational on Railway

**Result**: Users can now register and login independently without admin intervention.

### Future Enhancements
- [ ] Mobile responsive optimizations
- [ ] Keyboard shortcuts and accessibility
- [ ] Advanced grid customization options
- [ ] Widget marketplace/plugins system
- [ ] Performance optimizations for large dashboards
- [ ] PWA features (offline support, app installation)
