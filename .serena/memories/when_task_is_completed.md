Before marking a task done:
1) Lint: npm run lint
2) Build: npm run build (ensure no errors)
3) Manual checks:
   - Start backend: npm run server
   - Start frontend: npm run dev (or run npm run start for prod mode)
   - Verify key flows: company selection, formations list, inscription, admin login, API health.
4) If Dockerized changes: docker build -t formations-app . and run to confirm /api/health is OK.
5) Update README or deployment notes if behavior or env vars changed.
6) Commit using French conventional commit style.
7) If deploying to Azure: bump image version and use az acr build + update App Service as per README.