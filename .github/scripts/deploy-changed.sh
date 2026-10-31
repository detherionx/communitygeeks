#!/usr/bin/env bash
# Upload only the files under site/ that changed since the last successful deploy.
# The deployed commit is kept on the server in <remote>/.deployed-sha and written only after every upload succeeded,
# so a failed run is retried in full by the next one. Without a marker the base is the commit before this push
# (BEFORE); without that either, everything is uploaded. Deleted files stay on the server, as before.
#
# Env: HOST USER SSHPASS REMOTE (absolute remote dir) BEFORE (optional) BASE (optional, overrides the marker). DRY_RUN=1 prints the sftp batch.
set -euo pipefail

sftp_batch() {  # $1 = batch file, $2 = time limit in seconds
  timeout "$2" sshpass -e sftp -P 22 -o BatchMode=no -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 \
    -o ServerAliveInterval=15 -b "$1" "$USER@$HOST"
}

head_sha=$(git rev-parse HEAD)
base="${BASE:-}"
if [ -z "$base" ] && [ -z "${DRY_RUN:-}" ]; then
  rm -f /tmp/marker
  printf -- '-get "%s/.deployed-sha" /tmp/marker\n' "$REMOTE" > /tmp/read.sftp
  sftp_batch /tmp/read.sftp 120
  [ -f /tmp/marker ] && base=$(tr -d '[:space:]' < /tmp/marker)
  echo "Server marker: ${base:-none}"
fi
[ -z "$base" ] && base="${BEFORE:-}"
if [ -n "$base" ] && ! git cat-file -e "$base^{commit}" 2>/dev/null; then base=""; fi
case "$base" in 0000000000000000000000000000000000000000) base="" ;; esac

if [ -n "$base" ]; then
  echo "Base: $base"
  git diff --name-only --no-renames --diff-filter=ACMT "$base" "$head_sha" -- site > /tmp/changed
else
  echo "Base: none, uploading everything"
  git ls-files site > /tmp/changed
fi
if grep -q '"' /tmp/changed; then echo "File name with a quote, refusing" >&2; exit 1; fi

# Assets first, pages and .htaccess last, so no page goes live before the files it references.
{ grep -vE '(\.html|/\.htaccess)$' /tmp/changed || true; grep -E '(\.html|/\.htaccess)$' /tmp/changed || true; } > /tmp/ordered
count=$(wc -l < /tmp/ordered | tr -d ' ')
echo "Files to upload: $count"
sed 's/^/  /' /tmp/ordered

echo "$head_sha" > /tmp/deployed-sha
{
  # Every missing directory level, parents first ("-" ignores "already exists").
  sed 's#^site/##' /tmp/ordered | xargs -r -d '\n' -n1 dirname | { grep -v '^\.$' || true; } |
    awk -F/ '{p=""; for (i=1;i<=NF;i++) {p=(i>1?p"/":"")$i; print p}}' | sort -u |
    while read -r d; do printf -- '-mkdir "%s/%s"\n' "$REMOTE" "$d"; done
  while read -r f; do printf 'put "%s" "%s/%s"\n' "$f" "$REMOTE" "${f#site/}"; done < /tmp/ordered
  printf 'put /tmp/deployed-sha "%s/.deployed-sha"\n' "$REMOTE"
} > /tmp/deploy.sftp

if [ -n "${DRY_RUN:-}" ]; then cat /tmp/deploy.sftp; exit 0; fi
sftp_batch /tmp/deploy.sftp 2400
echo "Deployed $head_sha ($count files)"
