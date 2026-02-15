#!/usr/bin/env bash
set -e

NIX="nix develop --command"
SESSION="7591yj_github_io"
PROJECT_DIR="$HOME/Developer/7591yj.github.io_dev"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux attach-session -t "$SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n "dev" -c "$PROJECT_DIR" "$NIX bun run dev"
tmux set-option -t "$SESSION" remain-on-exit on
tmux new-window -t "$SESSION" -n "nvim" -c "$PROJECT_DIR" "$NIX nvim"
tmux new-window -t "$SESSION" -n "shell" -c "$PROJECT_DIR" "nix develop"

tmux select-window -t "$SESSION:nvim"

tmux attach-session -t "$SESSION"
