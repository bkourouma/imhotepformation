Project: FDFP-CGECI/ ASPCI - Plateforme de Formations
Purpose: Full-stack platform to manage professional training registrations with an admin panel, used by enterprises. Public catalog + per-enterprise data isolation.
Tech Stack:
- Frontend: React 19 + Vite 6
- Backend: Node.js 20 + Express 4
- DB: SQLite (better-sqlite3)
- Styling: Tailwind CSS 3
- Tooling: ESLint (flat config), PostCSS, Docker
- Runtime/Deploy: Azure App Service (container) and generic Docker. Also local dev via Vite + Express.
Entrypoints:
- Frontend dev: npm run dev (Vite on 5173)
- Backend dev: npm run server (Express on 3006)
- Full dev (both): npm run dev:full
- Prod start: npm run start (serves /dist via Express)
- Healthcheck: GET /api/health
Repo Structure (key):
- src/: React app (components, pages, hooks, services, utils)
- server/: Express API (routes, models, database)
- public/, dist/, uploads/
- Dockerfile, vite.config.js, eslint.config.js, tailwind.config.js
- deployment_vps_scripts/: VPS deploy scripts for other apps
Env Vars (common): NODE_ENV, PORT (3006 default in code), DB_PATH, CORS_ORIGIN, ADMIN_USERNAME/ADMIN_PASSWORD.
Notable configs:
- vite.config.js: proxy /api -> http://localhost:3006 in dev; manualChunks split.
- server/server.js: isProduction if NODE_ENV=production or PORT set or FORCE_PRODUCTION=true.
- Dockerfile: multi-stage-like steps, non-root user, healthcheck on /api/health port 3001.
Security: JWT, bcrypt; admin creds default admin/admin123 (from README).