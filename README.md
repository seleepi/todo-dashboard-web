# TODO Dashboard - Quick Start

## Running the Application

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
cd /home/lifi/Studium/Master/WebDev/projekt/todo-dashboard
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

For full project documentation, see the [main README](../README.md).
