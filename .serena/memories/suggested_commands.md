Setup & Install (Windows PowerShell):
- cd D:\ONEDRIVE\APPS\Formations\formations-app
- npm ci

Local Development:
- npm run dev          # Vite dev server (frontend at http://localhost:5173)
- npm run server       # Express API (backend at http://localhost:3006)
- npm run dev:full     # Run backend + frontend concurrently

Build & Run Production Locally:
- npm run build        # Builds React to /dist
- npm run start        # Starts Express serving API + /dist
- npm run preview      # Preview built frontend via Vite

Quality:
- npm run lint         # ESLint flat config
- npm audit            # Dependency audit

Docker (optional):
- docker build -t formations-app .
- docker run -p 3001:3001 formations-app

Environment:
- Copy .env.example to .env and set DB_PATH, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGIN as needed.

Entrypoints/Health:
- API health: curl http://localhost:3006/api/health (dev) or http://localhost:3001/api/health (Docker)

Notes:
- Vite dev proxy routes /api to http://localhost:3006
- Production mode is forced when NODE_ENV=production or PORT is set or FORCE_PRODUCTION=true.