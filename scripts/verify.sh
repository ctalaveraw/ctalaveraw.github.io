#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

completed=()
current="initialization"

summarize() {
  local status
  status=$1

  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      printf '## Portfolio verification\n\n'

      for check in "${completed[@]}"; do
        printf -- '- [x] %s\n' "$check"
      done

      if (( status != 0 )); then
        printf -- '- [ ] %s — failed (exit %s)\n' \
          "$current" "$status"
      fi
    } >> "$GITHUB_STEP_SUMMARY"
  fi

  if (( status != 0 )); then
    printf '\nFAIL: %s (exit %s)\n' "$current" "$status" >&2
  else
    printf '\nPASS: all verification gates\n'
  fi
}

trap 'summarize "$?"' EXIT

gate() {
  current="$1"
  shift

  printf '\n=== %s ===\n' "$current"
  "$@"

  completed+=("$current")
  printf 'PASS: %s\n' "$current"
}

gate "Shell scripts" bash scripts/check-shell.sh
gate "Formatting" npm run format:check
gate "ESLint" npm run lint
gate "Astro diagnostics" npm run check
gate "Production build" npm run build
gate "Static output" npm run test:output
gate "Dependency audit" npm audit --audit-level=high
