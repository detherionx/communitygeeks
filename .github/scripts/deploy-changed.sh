#!/usr/bin/env bash
# Upload only the files under site/ that changed since the last successful deploy.
# The deployed commit is kept on the server in <remote>/.deployed-sha and written only after every upload succeeded,
# so a failed run is retried in full by the next one. Without a marker the base is the commit before this push
# (BEFORE); without that either, everything is uploaded. Deleted files stay on the server, as before.
#
# Env: HOST USER LFTP_PASSWORD REMOTE (absolute remote dir) BEFORE (optional). DRY_RUN=1 prints the lftp script.
set -euo pipefail

lftp_open() {
  printf 'set sftp:auto-confirm yes\nset net:max-retries 3\nset net:timeout 30\nset cmd:fail-exit yes\n'
  printf 'open --env-password -u "%s" sftp://%s:22\n' "$USER" "$HOST"
}

head_sha=$(git rev-parse HEAD)
base=""
if [ -z "${DRY_RUN:-}" ]; then
  base=$( { lftp_open; printf 'cat "%s/.deployed-sha"\n' "$REMOTE"; } | lftp 2>/dev/null | tr -d '[:space:]' || true)
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
  lftp_open
  sed 's#^site/##' /tmp/ordered | xargs -r -d '\n' -n1 dirname | sort -u | grep -v '^\.$' |
    while read -r d; do printf 'mkdir -p -f "%s/%s"\n' "$REMOTE" "$d"; done
  while read -r f; do printf 'put "%s" -o "%s/%s"\n' "$f" "$REMOTE" "${f#site/}"; done < /tmp/ordered
  printf 'put /tmp/deployed-sha -o "%s/.deployed-sha"\n' "$REMOTE"
} > /tmp/deploy.lftp

if [ -n "${DRY_RUN:-}" ]; then grep -v '^open' /tmp/deploy.lftp; exit 0; fi
lftp -f /tmp/deploy.lftp
echo "Deployed $head_sha ($count files)"
