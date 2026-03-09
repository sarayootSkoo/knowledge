#!/usr/bin/env bash
# knowledge/scripts/install-hooks.sh
# Install the knowledge-sync post-commit hook into one or all projects.
#
# Usage:
#   bash knowledge/scripts/install-hooks.sh oms-order        # single project
#   bash knowledge/scripts/install-hooks.sh --all            # all projects with .git

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
HOOK_SOURCE="$ROOT_DIR/knowledge/scripts/hooks/post-commit"

install_hook() {
  local project="$1"
  local project_dir="$ROOT_DIR/$project"
  local git_dir="$project_dir/.git"

  if [[ ! -d "$project_dir" ]]; then
    echo "  SKIP  $project — directory not found"
    return
  fi

  if [[ ! -d "$git_dir" ]]; then
    echo "  SKIP  $project — no .git folder (not a git repo)"
    return
  fi

  local hooks_dir="$git_dir/hooks"
  mkdir -p "$hooks_dir"

  # Back up existing hook if present
  if [[ -f "$hooks_dir/post-commit" ]]; then
    cp "$hooks_dir/post-commit" "$hooks_dir/post-commit.backup"
    echo "  BACKUP  $project — existing hook saved as post-commit.backup"
  fi

  cp "$HOOK_SOURCE" "$hooks_dir/post-commit"
  chmod +x "$hooks_dir/post-commit"
  echo "  OK  $project — knowledge-sync hook installed"
}

echo ""
echo "Knowledge Center — Hook Installer"
echo "=================================="
echo ""

if [[ "$1" == "--all" ]]; then
  echo "Installing hook in all projects with .git..."
  echo ""
  for dir in "$ROOT_DIR"/*/; do
    name=$(basename "$dir")
    [[ "$name" == .* ]] && continue
    [[ "$name" == "knowledge" ]] && continue
    [[ "$name" == "specs" ]] && continue
    [[ -d "$dir/.git" ]] && install_hook "$name"
  done
elif [[ -z "$1" ]]; then
  echo "Usage:"
  echo "  $0 <project-name>   Install in a specific project"
  echo "  $0 --all            Install in all projects with .git"
  echo ""
  echo "Example:"
  echo "  bash knowledge/scripts/install-hooks.sh oms-order"
  exit 1
else
  install_hook "$1"
fi

echo ""
echo "Done."
