#!/bin/sh
set -e

echo "🚀 Esperando a que la base de datos esté lista..."

# Esperar a que PostgreSQL esté disponible
until pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER"; do
  echo "⏳ La base de datos no está lista - esperando..."
  sleep 2
done

echo "✅ Base de datos lista!"

echo "🔄 Ejecutando migraciones..."
pnpm run migration:run

echo "✅ Migraciones completadas!"

echo "🚀 Iniciando aplicación..."
exec "$@"
