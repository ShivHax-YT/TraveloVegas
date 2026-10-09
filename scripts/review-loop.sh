#!/usr/bin/env bash
# Watches main. When a new commit lands, Codex reviews it (read-only) and saves reviews/<sha>.md
# Claude BUILD reads the newest review at the start of each round (see CLAUDE.md).
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p reviews
last=""
echo "REVIEW lane: watching main for new commits (Ctrl-C to stop)"
while true; do
  sha=$(git rev-parse --short main 2>/dev/null)
  if [ -n "$sha" ] && [ "$sha" != "$last" ] && [ ! -f "reviews/$sha.md" ]; then
    echo "Reviewing $sha ..."
    codex exec --sandbox read-only "$(cat prompts-archive/codex-review.md) Focus on what changed in commit $sha (git show $sha)." > "reviews/$sha.md" 2>&1 \
      && cp "reviews/$sha.md" reviews/LATEST.md && echo "Saved reviews/$sha.md"
    last="$sha"
  fi
  sleep 60
done
