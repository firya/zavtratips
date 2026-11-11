#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
cd /opt/apps/zavtratips
state=/var/lib/zavtratips-deploy
mkdir -p "$state/requests" "$state/failed" "$state/backups"
exec 9>"$state/lock"
flock -n 9 || exit 0
shopt -s nullglob
requests=("$state"/requests/*.json)
if (( ${#requests[@]} == 0 )) && [[ ${1:-} != --manual ]]; then exit 0; fi

old_image=''
image_ref=''
restarted=0
finish() {
  result=$?
  trap - EXIT
  if (( result != 0 )); then
    echo "Deployment failed ($result)"
    if (( restarted == 1 )) && [[ -n $old_image && -n $image_ref ]]; then
      docker image tag "$old_image" "$image_ref"
      docker compose up -d --no-deps app || true
      echo 'Previous image restored'
    fi
    for file in "${requests[@]}"; do mv -- "$file" "$state/failed/"; done
  else
    for file in "${requests[@]}"; do rm -f -- "$file"; done
  fi
  exit "$result"
}
trap finish EXIT

git diff --quiet
git diff --cached --quiet
test "$(git remote get-url origin)" = https://github.com/firya/zavtratips
git fetch origin main
target=$(git rev-parse origin/main)
if [[ -f $state/deployed-commit ]] && [[ $(cat "$state/deployed-commit") == "$target" ]]; then
  echo "Already deployed $target"
  exit 0
fi
git merge --ff-only origin/main
echo "Building $target"
old_image=$(docker inspect zavtratips --format '{{.Image}}')
image_ref=$(docker compose config --images | head -n 1)
docker image tag "$old_image" zavtratips:previous
# Tests run inside the builder, before the working container is touched.
docker compose build app
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$state/backups/$(date -u +%Y%m%dT%H%M%SZ)-$target.sql.gz"
restarted=1
docker compose up -d --no-deps app
healthy=0
for attempt in $(seq 1 30); do
  if docker exec zavtratips node -e 'fetch("http://127.0.0.1:3000/api/config").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'; then
    healthy=1
    break
  fi
  sleep 3
done
test "$healthy" = 1
printf '%s\n' "$target" > "$state/deployed-commit.tmp"
mv "$state/deployed-commit.tmp" "$state/deployed-commit"
install -m 0755 scripts/deploy.sh /usr/local/sbin/zavtratips-deploy
echo "Deployed $target"
