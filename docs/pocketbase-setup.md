# PocketBase Setup Instructions

## 1. Access Admin Panel

Open your browser and go to: **http://127.0.0.1:8090/_/**

Create an admin account when prompted.

## 2. Create Collections

### A. Users Collection (Auth)
This should already exist as a default auth collection. Verify it has these fields:
- `email` (Email)
- `name` (Text)
- `avatar` (File - single, optional)

### B. Dashboards Collection
Create new collection called `dashboards`:

**Settings:**
- Name: `dashboards`
- Type: `Base`

**Fields:**
- `user` (Relation - single, required)
  - Related collection: `users`
  - Cascade delete: Yes
- `name` (Text, required)
  - Min length: 1
  - Max length: 100
- `background` (Text, optional)
  - Max length: 50
  - Default: `#f0f9ff`

**API Rules:**
- List rule: `user = @request.auth.id`
- View rule: `user = @request.auth.id`
- Create rule: `user = @request.auth.id`
- Update rule: `user = @request.auth.id`
- Delete rule: `user = @request.auth.id`

### C. Widgets Collection
Create new collection called `widgets`:

**Settings:**
- Name: `widgets`
- Type: `Base`

**Fields:**
- `dashboard` (Relation - single, required)
  - Related collection: `dashboards`
  - Cascade delete: Yes
- `type` (Select - single, required)
  - Options: `todo`, `text`, `clock-weather`, `youtube`
- `position_x` (Number, required)
  - Default: 0
- `position_y` (Number, required)
  - Default: 0
- `size_width` (Number, required)
  - Default: 300
- `size_height` (Number, required)
  - Default: 200
- `data` (JSON, optional)
  - For storing widget-specific data (todos, text content, etc.)
- `collapsed` (Bool, optional)
  - Default: false

**API Rules:**
- List rule: `dashboard.user = @request.auth.id`
- View rule: `dashboard.user = @request.auth.id`
- Create rule: `dashboard.user = @request.auth.id`
- Update rule: `dashboard.user = @request.auth.id`
- Delete rule: `dashboard.user = @request.auth.id`

## 3. Test Collections

After creating the collections, you should be able to:

1. Create a test user account
2. Create a test dashboard for that user
3. Create test widgets for that dashboard

## 4. API Endpoints

Once setup is complete, you'll have these endpoints:

- **Auth**: `POST /api/collections/users/auth-with-password`
- **Dashboards**: `GET /api/collections/dashboards/records`
- **Widgets**: `GET /api/collections/widgets/records`

## 5. Real-time Subscriptions

PocketBase supports real-time updates via SSE:
- Dashboard changes: `/api/realtime`
- Widget changes: `/api/realtime`




temp
✅ PocketBase Setup Complete:
  - Downloaded & Running: PocketBase server at http://127.0.0.1:8090
  - JavaScript SDK: Installed and configured
  - Client Utilities: Complete helper functions for auth, dashboards, widgets
  - Environment Config: Proper environment variables setup
  - Setup Guide: Step-by-step instructions for creating collections

  🔧 Next Steps:

  1. Set up collections - Follow the pocketbase-setup.md instructions to create the database schema
  2. Test the setup - Create a test user and dashboard
  3. Integrate with React - Connect the frontend to save/load dashboard state

  To set up the collections:
  1. Open http://127.0.0.1:8090/_/ in your browser
  2. Create an admin account
  3. Follow the instructions in pocketbase-setup.md to create the collections

  The collections we need:
  - Users (auth) - Already exists
  - Dashboards - User's dashboard instances
  - Widgets - Individual widgets with positions and data

  dashboard has no scroll down function even if the widgets are too many, so i can't see the widgets below.

  Want me to help you set up the collections, or would you prefer to do it manually using the setup guide? Once the collections are ready, we can integrate data persistence into your
  dashboard! 🚀