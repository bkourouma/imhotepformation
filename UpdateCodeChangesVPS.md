### Updating the VPS after code changes

Follow these steps on the VPS to deploy new changes safely.

- Stop the app (avoids SQLite WAL/SHM conflicts)

```bash
pm2 stop imhotepformation-app
```

- Pull latest code and install dependencies

```bash
cd /opt/imhotepformation
git pull
npm ci
npm run build
```

- Restart the app

```bash
pm2 restart imhotepformation-app
pm2 save
```

- Validate

```bash
curl -fsS http://127.0.0.1:3001/api/health
curl -fsS https://imhotepformation.engage-360.net/api/health
```

### Notes

- If environment variables changed, reload them:

```bash
pm2 restart imhotepformation-app --update-env
```

- If only Nginx config changed, test and reload (no restart needed):

```bash
nginx -t && systemctl reload nginx
```

- If `git pull` complains about `formations.db-wal` or `formations.db-shm`:

```bash
pm2 stop imhotepformation-app
cd /opt/imhotepformation
rm -f server/database/formations.db-{wal,shm}
git reset --hard HEAD
git pull
npm ci && npm run build
pm2 restart imhotepformation-app
```


