#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT" || exit 2

printf '\nPROVOWARE — Klick & Start\n'
printf '========================\n'

PYTHON=""
if [ -x "$ROOT/.venv/bin/python" ]; then
  PYTHON="$ROOT/.venv/bin/python"
elif command -v python3.13 >/dev/null 2>&1; then
  PYTHON="$(command -v python3.13)"
elif command -v python3 >/dev/null 2>&1; then
  VERSION="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null)"
  if [ "$VERSION" = "3.13" ]; then
    PYTHON="$(command -v python3)"
  fi
fi

if [ -z "$PYTHON" ]; then
  printf 'FEHLER: Python 3.13 wurde nicht gefunden.\n'
  printf 'Erwartet wird Python >=3.13,<3.14.\n'
  RC=2
else
  printf 'Python: %s\n\n' "$PYTHON"
  "$PYTHON" "$ROOT/WERKZEUGE/projekt_start.py" "$@"
  RC=$?
fi

printf '\n'
if [ "$RC" -eq 0 ]; then
  printf 'PROVOWARE-Startprüfung erfolgreich.\n'
else
  printf 'PROVOWARE-Startprüfung mit Status %s beendet.\n' "$RC"
fi

if [ -t 0 ] && [ "${PROVOWARE_KEIN_WARTEN:-0}" != "1" ]; then
  printf '\nEnter drücken zum Schließen ... '
  read -r _
fi
exit "$RC"
