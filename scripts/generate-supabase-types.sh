#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="$ROOT_DIR/src/types/supabase.ts"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to generate Supabase types." >&2
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

npx supabase@latest gen types typescript --linked --schema public >"$TMP_FILE"

mv "$TMP_FILE" "$OUTPUT_FILE"
echo "Supabase types written to $OUTPUT_FILE"
