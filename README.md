# TODO Dashboard

A personalized dashboard application where users can place various widgets including TODO lists, time, weather, and YouTube player widgets.

## 📁 Project Structure

```
todo-dashboard-web/
├── frontend/          # Next.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── ...            # Config files (package.json, tsconfig.json, etc.)
├── backend/           # PocketBase backend
│   ├── pocketbase/    # PocketBase configuration
│   ├── pb_data/       # Database files
│   └── pocketbase.exe # PocketBase executable (Windows)
└── docs/              # Documentation
    ├── README.md      # Detailed user guide
    ├── GOOGLE_OAUTH_SETUP.md
    └── pocketbase-setup.md
```

## 🚀 Quick Start

### 1. Start Backend (PocketBase)

```bash
cd backend
./pocketbase serve     # On Linux/Mac
# or
pocketbase.exe serve   # On Windows
```

- PocketBase will run at: http://127.0.0.1:8090
- Admin panel: http://127.0.0.1:8090/_/

### 2. Start Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- App will run at: http://localhost:3000

## 📚 Documentation

For detailed setup instructions and usage guide, see:
- [**Complete User Guide**](./docs/README.md) - Full documentation
- [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)
- [PocketBase Setup](./docs/pocketbase-setup.md)

## ✨ Features

- **Multi-Dashboard Support**: Create and manage multiple personalized dashboards
- **Google OAuth**: One-click login with Google account
- **Widget System**: TODO lists, text notes, clock/weather, YouTube player
- **Drag & Drop**: Intuitive widget positioning
- **Real-time Sync**: Automatic synchronization across devices
- **Responsive Design**: Works on desktop and mobile

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: PocketBase (SQLite)
- **Authentication**: Google OAuth 2.0 + PocketBase Auth

## 📝 License

ISC License - See [LICENSE.md](./docs/LICENSE.md)

## 👤 Author

selee_pi

## 🐛 Issues

Report issues at: https://github.com/seleepi/todo-dashboard-web/issues
