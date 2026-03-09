#!/usr/bin/env bash
# knowledge/scripts/health-check.sh
# Shows documentation coverage score for every project.
# Usage:
#   bash knowledge/scripts/health-check.sh           # human-readable output
#   bash knowledge/scripts/health-check.sh --json    # JSON output

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
JSON_MODE=false
[[ "$1" == "--json" ]] && JSON_MODE=true

# ANSI colors (suppressed in JSON mode)
if [[ "$JSON_MODE" == false ]]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  GREEN=''; RED=''; YELLOW=''; NC=''
fi

# Score a single project directory
# Output: "score|detail1|detail2|detail3"
score_project() {
  local dir="$1"
  local score=0
  local d_claude="MISSING"
  local d_docs="MISSING"
  local d_overview="MISSING"

  # Check 1: CLAUDE.md with meaningful content (> 10 lines)
  if [[ -f "$dir/CLAUDE.md" ]] && [[ $(wc -l < "$dir/CLAUDE.md") -gt 10 ]]; then
    ((score++))
    d_claude="OK"
  fi

  # Check 2: docs/ folder exists
  if [[ -d "$dir/docs" ]]; then
    ((score++))
    d_docs="OK"
  fi

  # Check 3: docs/BUSINESS_OVERVIEW.md exists
  if [[ -f "$dir/docs/BUSINESS_OVERVIEW.md" ]]; then
    ((score++))
    d_overview="OK"
  fi

  echo "$score|$d_claude|$d_docs|$d_overview"
}

if [[ "$JSON_MODE" == false ]]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║             Knowledge Center — Health Check                  ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  printf "%-38s %-8s %-12s %-8s %-18s\n" "Project" "Score" "CLAUDE.md" "docs/" "BUSINESS_OVERVIEW"
  printf "%-38s %-8s %-12s %-8s %-18s\n" "-------" "-----" "---------" "-----" "-----------------"
fi

total=0
perfect=0
warn=0
critical=0
json_entries=()

for dir in "$ROOT_DIR"/*/; do
  name=$(basename "$dir")

  # Skip non-project directories
  [[ "$name" == .* ]]             && continue
  [[ "$name" == "specs" ]]        && continue
  [[ "$name" == "knowledge" ]]    && continue
  [[ "$name" == "dist" ]]         && continue
  [[ "$name" == "logs" ]]         && continue
  [[ "$name" == "coverage" ]]     && continue
  [[ "$name" == "node_modules"* ]] && continue
  [[ "$name" == "src" ]]          && continue
  [[ "$name" == "app" ]]          && continue
  [[ "$name" == "test" ]]         && continue
  [[ "$name" == "PMP" ]]          && continue

  result=$(score_project "$dir")
  IFS='|' read -r score d_claude d_docs d_overview <<< "$result"
  ((total++))

  # Determine badge
  badge="RED"
  if [[ $score -eq 3 ]]; then
    badge="GREEN"; ((perfect++))
  elif [[ $score -eq 2 ]]; then
    badge="YELLOW"; ((warn++))
  else
    ((critical++))
  fi

  if [[ "$JSON_MODE" == true ]]; then
    json_entries+=("{\"project\":\"$name\",\"score\":$score,\"claude_md\":\"$d_claude\",\"docs\":\"$d_docs\",\"business_overview\":\"$d_overview\"}")
  else
    # Visual badge
    vis_badge="🔴"
    [[ "$badge" == "GREEN" ]]  && vis_badge="🟢"
    [[ "$badge" == "YELLOW" ]] && vis_badge="🟡"

    claude_icon="❌"; [[ "$d_claude" == "OK" ]]   && claude_icon="✅"
    docs_icon="❌";   [[ "$d_docs" == "OK" ]]      && docs_icon="✅"
    over_icon="❌";   [[ "$d_overview" == "OK" ]]  && over_icon="✅"

    printf "%-38s %s %s/3  %-12s %-8s %-18s\n" \
      "$name" "$vis_badge" "$score" "$claude_icon" "$docs_icon" "$over_icon"
  fi
done

if [[ "$JSON_MODE" == true ]]; then
  # JSON output
  coverage=0
  [[ $total -gt 0 ]] && coverage=$(( perfect * 100 / total ))
  echo "{"
  echo "  \"summary\": {"
  echo "    \"total\": $total,"
  echo "    \"full_coverage\": $perfect,"
  echo "    \"partial\": $warn,"
  echo "    \"critical\": $critical,"
  echo "    \"coverage_percent\": $coverage"
  echo "  },"
  echo "  \"projects\": ["
  for i in "${!json_entries[@]}"; do
    if [[ $i -lt $(( ${#json_entries[@]} - 1 )) ]]; then
      echo "    ${json_entries[$i]},"
    else
      echo "    ${json_entries[$i]}"
    fi
  done
  echo "  ]"
  echo "}"
else
  coverage=0
  [[ $total -gt 0 ]] && coverage=$(( perfect * 100 / total ))
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Total projects: $total"
  echo "  🟢 Full coverage (3/3): $perfect"
  echo "  🟡 Partial      (2/3): $warn"
  echo "  🔴 Needs docs  (0-1/3): $critical"
  echo "  Coverage: ${coverage}%"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Fix critical projects:"
  echo "  bash knowledge/scripts/health-check.sh | grep '🔴'"
  echo ""
  echo "Update knowledge center after fixing:"
  echo "  bash knowledge/scripts/scan-projects.sh"
fi
