#!/bin/bash
# Load .env file and start dev server
set -a
[ -f .env ] && . .env
set +a
exec pnpm --filter web dev "$@"
