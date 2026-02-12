#!/usr/bin/env bash
set -euo pipefail
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/bootstrap.log"
mkdir -p "$LOG_DIR"

log() {
  local level="$1"; shift
  local message="$1"; shift
  printf '%s %s %s\n' "$(date --iso-8601=seconds)" "$level" "$message" | tee -a "$LOG_FILE"
}

log INFO "Startroutine gestartet"

if [ ! -f package-lock.json ]; then
  log INFO "Führe npm install aus (keine zusätzlichen Pakete erforderlich)"
  npm install --package-lock-only >/dev/null 2>&1 || log WARN "npm install meldete einen Hinweis"
fi

commands=(
  "node scripts/format.js"
  "node scripts/lint.js"
  "node scripts/test.js"
  "node scripts/contrast.js"
  "node scripts/accessibility.js"
)

for cmd in "${commands[@]}"; do
  log INFO "Starte $cmd"
  if $cmd >>"$LOG_FILE" 2>&1; then
    log INFO "✓ $cmd erfolgreich"
  else
    log ERROR "✗ $cmd fehlgeschlagen"
  fi
done

log INFO "Startroutine abgeschlossen"
