#!/usr/bin/env bash
set -euo pipefail

SESSION="7591yj_github_io"
PROJECT_DIR="${PROJECT_DIR:-$HOME/Developer/7591yj.github.io}"
SHELL_BIN="${SHELL:-/bin/bash}"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  exec tmux attach-session -t "$SESSION"
fi

tmux new-session -d -s "$SESSION" -n "dev" -c "$PROJECT_DIR" "$SHELL_BIN -il"
tmux set-option -t "$SESSION" remain-on-exit on
tmux new-window -t "$SESSION" -n "nvim" -c "$PROJECT_DIR" "$SHELL_BIN -il"
tmux new-window -t "$SESSION" -n "shell" -c "$PROJECT_DIR" "$SHELL_BIN -il"
tmux send-keys -t "$SESSION:dev" "devenv up" C-m
tmux send-keys -t "$SESSION:nvim" "nvim" C-m
tmux select-window -t "$SESSION:nvim"

exec tmux attach-session -t "$SESSION"
