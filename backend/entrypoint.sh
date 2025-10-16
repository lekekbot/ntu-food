#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting NTU Food backend"
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "🔗 DATABASE_URL detected"
else
  echo "⚠️  DATABASE_URL not set; defaulting to SQLite if configured"
fi

echo "🔄 Running database migrations..."
# Ensure our package paths are available
export PYTHONPATH=/app/backend

# Run idempotent migrations (they check and only apply if needed)
python migrations/add_location_to_stalls.py || true
python migrations/enhance_orders_for_complete_flow.py || true

# Optional: seed admin user on first deploy
if [[ "${SEED_ADMIN_ON_START:-false}" == "true" ]]; then
  echo "🌱 Seeding admin user..."
  python seed_admin.py || true
fi

PORT_TO_USE="${PORT:-8000}"
echo "🌐 Starting Uvicorn on port ${PORT_TO_USE}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT_TO_USE}"