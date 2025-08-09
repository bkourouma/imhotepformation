#!/usr/bin/env bash

# Safe, idempotent deployment script for imhotepformation.engage-360.net
# Multi-site aware: only touches this app's process, directory and Nginx vhost

set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

# Configurable variables
APP_NAME=${APP_NAME:-imhotepformation-app}
DOMAIN=${DOMAIN:-imhotepformation.engage-360.net}
APP_DIR=${APP_DIR:-/opt/imhotepformation}
REPO_URL=${REPO_URL:-https://github.com/bkourouma/imhotepformation.git}
PM2_JSON=${PM2_JSON:-}
DEFAULT_PORT=${DEFAULT_PORT:-3006}
PORT_CANDIDATES=(3006 3012 3016 3020 3024 3030)
CERTBOT_EMAIL=${CERTBOT_EMAIL:-admin@engage-360.net}

# Helper: check if a TCP port is in use
is_port_used() {
  local port=$1
  if command -v ss >/dev/null 2>&1; then
    ss -tulpn | grep -q ":${port} " || ss -tulpn | grep -q ":${port}$" || return 1
  else
    netstat -tulpn 2>/dev/null | grep -q ":${port} " || netstat -tulpn 2>/dev/null | grep -q ":${port}$" || return 1
  fi
}

pick_backend_port() {
  for p in "${PORT_CANDIDATES[@]}"; do
    if ! is_port_used "$p"; then
      echo "$p"; return 0
    fi
  done
  # fallback: find a high port
  for p in $(seq 3500 3600); do
    if ! is_port_used "$p"; then echo "$p"; return 0; fi
  done
  echo "$DEFAULT_PORT"
}

require_root() {
  if [ "$(id -u)" != "0" ]; then
    err "Run this script as root (sudo)."; exit 1
  fi
}

install_prereqs() {
  info "Installing prerequisites (non-interactive) ..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y >/dev/null
  apt-get install -y curl git nginx certbot python3-certbot-nginx >/dev/null
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs >/dev/null
  fi
  npm install -g pm2 >/dev/null 2>&1 || true
  ok "Prerequisites ready"
}

backup_existing_nginx() {
  if [ -f "/etc/nginx/sites-available/${DOMAIN}" ]; then
    cp "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-available/${DOMAIN}.bak.$(date +%Y%m%d%H%M%S)" || true
  fi
  if [ -f "/etc/nginx/sites-available/imhotepformation" ]; then
    cp "/etc/nginx/sites-available/imhotepformation" "/etc/nginx/sites-available/imhotepformation.bak.$(date +%Y%m%d%H%M%S)" || true
  fi
}

clean_previous_install() {
  info "Stopping and removing previous PM2 process for ${APP_NAME} (if any) ..."
  pm2 stop    "${APP_NAME}"  >/dev/null 2>&1 || true
  pm2 delete  "${APP_NAME}"  >/dev/null 2>&1 || true
  ok "PM2 process removed (if existed)"

  info "Removing old Nginx vhost for ${DOMAIN} (safe) ..."
  rm -f "/etc/nginx/sites-enabled/${DOMAIN}" "/etc/nginx/sites-available/${DOMAIN}" || true
  rm -f /etc/nginx/sites-enabled/imhotepformation /etc/nginx/sites-available/imhotepformation || true
  ok "Old vhost removed if existed"

  if [ -d "${APP_DIR}" ]; then
    info "Removing app directory ${APP_DIR} (safe exact path) ..."
    rm -rf "${APP_DIR}"
    ok "Removed ${APP_DIR}"
  fi
}

clone_and_build() {
  info "Cloning repository into ${APP_DIR} ..."
  mkdir -p "${APP_DIR}"
  git clone --depth 1 "${REPO_URL}" "${APP_DIR}" >/dev/null
  ok "Code cloned"

  info "Installing dependencies ..."
  cd "${APP_DIR}"
  npm ci >/dev/null
  ok "Dependencies installed"

  info "Building frontend ..."
  npm run build >/dev/null
  ok "Build complete"
}

configure_env() {
  local port=$1
  info "Writing .env (port ${port}) ..."
  cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
PORT=${port}
JWT_SECRET=
EOF
  ok ".env configured"
}

start_pm2() {
  info "Starting app with PM2 as ${APP_NAME} ..."
  cd "${APP_DIR}"
  pm2 start server/server.js --name "${APP_NAME}" --time --env production
  pm2 save >/dev/null || true
  pm2 startup >/dev/null 2>&1 || true
  ok "PM2 started"
}

write_nginx_vhost() {
  local port=$1
  info "Creating Nginx vhost for ${DOMAIN} -> 127.0.0.1:${port} ..."
  cat > "/etc/nginx/sites-available/${DOMAIN}" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
}
NGINX

  ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
  nginx -t
  systemctl reload nginx
  ok "Nginx vhost enabled and reloaded"
}

provision_ssl() {
  info "Ensuring SSL via certbot for ${DOMAIN} ..."
  if certbot certificates | grep -q "${DOMAIN}"; then
    ok "Certificate already present"
    return 0
  fi
  if [ -n "${CERTBOT_EMAIL}" ]; then
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${CERTBOT_EMAIL}" || warn "Certbot failed (check DNS and HTTP reachability)."
  else
    warn "CERTBOT_EMAIL not set; skipping automatic SSL provisioning."
  fi
}

health_checks() {
  local port=$1
  info "Waiting a few seconds then checking health ..."
  sleep 4
  if curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null; then
    ok "Local health OK on ${port}"
  else
    warn "Local health check failed on ${port}"
  fi
  if curl -fsSI "https://${DOMAIN}" >/dev/null; then
    ok "HTTPS endpoint reachable"
  else
    warn "HTTPS check failed (may be before SSL or DNS ready)"
  fi
}

main() {
  require_root

  info "Multi-site safety: listing current Nginx sites and used ports ..."
  ls -la /etc/nginx/sites-enabled/ || true
  (ss -tulpn || netstat -tulpn) 2>/dev/null | grep -E ':80 |:443 |:8080 |:8095 |:8099 |:3006 ' || true

  install_prereqs
  backup_existing_nginx
  clean_previous_install

  local backend_port
  backend_port=$(pick_backend_port)
  info "Selected backend port: ${backend_port}"

  clone_and_build
  configure_env "${backend_port}"
  start_pm2
  write_nginx_vhost "${backend_port}"
  provision_ssl
  health_checks "${backend_port}"

  ok "Deployment complete for ${DOMAIN}"
  echo "PM2:    pm2 status | pm2 logs ${APP_NAME}"
  echo "Nginx:  nginx -t && systemctl reload nginx"
  echo "Health: curl -fsS https://${DOMAIN}/api/health || true"
}

main "$@"


