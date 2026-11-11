#!/usr/bin/env bash
set -Eeuo pipefail
cd /opt/apps/zavtratips
install -d -m 0700 /var/lib/zavtratips-deploy /var/lib/zavtratips-deploy/requests /var/lib/zavtratips-deploy/failed /var/lib/zavtratips-deploy/backups
install -m 0755 scripts/deploy.sh /usr/local/sbin/zavtratips-deploy
cat > /etc/systemd/system/zavtratips-deploy.service <<'UNIT'
[Unit]
Description=Deploy ZavtraTips from GitHub main after a signed webhook
After=docker.service network-online.target
Requires=docker.service
[Service]
Type=oneshot
ExecStart=/usr/local/sbin/zavtratips-deploy
TimeoutStartSec=20min
UNIT
cat > /etc/systemd/system/zavtratips-deploy.path <<'UNIT'
[Unit]
Description=Watch accepted ZavtraTips GitHub webhook events
[Path]
PathExistsGlob=/var/lib/zavtratips-deploy/requests/*.json
Unit=zavtratips-deploy.service
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now zavtratips-deploy.path
