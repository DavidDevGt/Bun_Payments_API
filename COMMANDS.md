# 🔧 Referencia Rápida de Comandos

## Desarrollo

```bash
# Instalar dependencias
bun install

# Ejecutar en desarrollo (con hot reload)
bun run dev

# Compilar TypeScript
bun run build

# Ejecutar build compilado
bun run start

# Validar tipos
bun run type-check

# Ejecutar suite de pruebas
bash test-api.sh
```

## Base de Datos

```bash
# Sincronizar esquema con BD
bun run db:push

# Abrir Drizzle Studio (GUI)
bun run db:studio

# Eliminar BD y recrear (si se corrompe)
rm sqlite.db*
bun run dev
```

## Docker

```bash
# Construir imagen
docker build -t bun-payments-api:1.0.0 .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -v $(pwd)/sqlite.db:/app/sqlite.db \
  bun-payments-api:1.0.0

# Con Docker Compose
docker-compose up --build
docker-compose up -d          # En background
docker-compose logs -f api    # Ver logs
docker-compose down           # Detener
```

## API - Ejemplos curl

### Servicios

```bash
# Crear
curl -X POST http://localhost:3000/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 12.99,
    "dueDate": 5,
    "category": "Entretenimiento"
  }'

# Listar
curl http://localhost:3000/api/v1/services

# Obtener uno
curl http://localhost:3000/api/v1/services/1

# Actualizar
curl -X PUT http://localhost:3000/api/v1/services/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 14.99}'

# Eliminar
curl -X DELETE http://localhost:3000/api/v1/services/1
```

### Pagos

```bash
# Crear pagos mensuales
curl -X POST "http://localhost:3000/api/v1/payments/monthly?month=2026-04"

# Listar pagos del mes
curl "http://localhost:3000/api/v1/payments/month?month=2026-04"

# Ver resumen del mes
curl "http://localhost:3000/api/v1/payments/summary/month?month=2026-04"

# Cambiar estado a pagado
curl -X PUT http://localhost:3000/api/v1/payments/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paymentMethod": "Tarjeta de Crédito"
  }'

# Ver historial de un servicio
curl "http://localhost:3000/api/v1/payments/service/1"
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Troubleshooting

```bash
# Puerto 3000 ocupado
PORT=3001 bun run dev

# Ver errores de compilación
bun run type-check

# Limpiar y reconstruir
rm -rf dist node_modules
bun install
bun run build

# Verificar que todo compila
bun run type-check && bun run build

# Resetear BD completamente
rm -f sqlite.db*
bun run dev
```

## Despliegue

### Local
```bash
# Desarrollo
bun run dev

# Producción
bun run build && bun run start
```

### Docker
```bash
docker-compose up --build
```

### Vercel
```bash
bunx vercel deploy
```

## Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar según necesites
# PORT=3000
# NODE_ENV=development
```

## Información Útil

```bash
# Ver versión de Bun
bun --version

# Ver información del proyecto
cat package.json

# Listar dependencias instaladas
bun pm ls

# Actualizar Bun
bun upgrade
```

## Debugging

```bash
# Ejecutar con debugging
DEBUG=* bun run dev

# Ver logs detallados
# Ya está integrado en los controllers

# Inspeccionar con Drizzle Studio
bun run db:studio
# Abre en http://localhost:3001
```

---

**Tip:** Guarda este archivo para referencia rápida durante el desarrollo.
