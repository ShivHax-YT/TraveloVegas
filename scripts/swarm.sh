#!/usr/bin/env bash
# One command -> a tmux session with parallel lanes.
#   pane 1  BUILD   interactive Claude Code in the main repo (you talk to this one)
#   pane 2  DATA    headless Claude in its own git worktree, verifying listings (edits data/ only)
#   pane 3  REVIEW  Codex CLI auto-reviews every new commit on main (read-only, writes reviews/)
# Usage: ./scripts/swarm.sh        stop: tmux kill-session -t tv
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
command -v tmux >/dev/null || { echo "Install tmux first: brew install tmux"; exit 1; }
git rev-parse HEAD >/dev/null 2>&1 || { echo "Make at least one commit first."; exit 1; }

# Separate worktree so the data lane never touches the files BUILD is editing
DATA_WT="$ROOT/../TraveloVegas-data"
[ -d "$DATA_WT" ] || git worktree add -B lane/data "$DATA_WT" main

tmux kill-session -t tv 2>/dev/null || true
tmux new-session -d -s tv -n lanes -c "$ROOT" "claude"
tmux split-window -h -t tv:lanes -c "$DATA_WT" \
  "claude -p \"\$(cat '$ROOT/prompts-archive/lane-data.md')\" --permission-mode acceptEdits; echo; echo 'DATA lane done. Merge with: git merge lane/data'; exec \$SHELL"
tmux split-window -v -t tv:lanes.1 -c "$ROOT" "./scripts/review-loop.sh"
tmux select-layout -t tv:lanes main-vertical
tmux select-pane -t tv:lanes.0
tmux attach -t tv
