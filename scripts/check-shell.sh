#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

mapfile -d '' -t files < <(
  find scripts -type f -name '*.sh' -print0 | sort -z
)

if (( ${#files[@]} == 0 )); then
  echo "No shell scripts found"
  exit 0
fi

echo "Checking ${#files[@]} shell scripts"

for file in "${files[@]}"; do
  echo "Syntax: $file"
  bash -n "$file"
done

shellcheck --severity=style "${files[@]}"

echo "PASS: shell syntax and ShellCheck"
