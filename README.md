# Bun Payments API

![CI/CD Status](https://img.shields.io/github/actions/workflow/status/your-repo/ci.yml?branch=main)
![Coverage](https://img.shields.io/codecov/c/github/your-repo/bun-payments-api)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Una API RESTful profesional para la gestión de pagos mensuales de servicios, construida con Bun, Hono.js y TypeScript.

## 🚀 Características

- ✅ CRUD completo para servicios
- ✅ Gestión de pagos mensuales (Pagados, Pendientes, Atrasados)
- ✅ Resumen mensual con análisis de pagos
- ✅ Validación robusta con Zod
- ✅ Manejo centralizado de errores
- ✅ Logger integrado
- ✅ TypeScript con modo estricto
- ✅ SQLite con Drizzle ORM
- ✅ Dockerizado y listo para producción

## 📋 Requisitos

- [Bun](https://bun.sh) v1.3.4 o superior
- Docker y Docker Compose (opcional)

## 🔧 Instalación

### Desarrollo Local

```bash
# Clonar o navegar al directorio
cd Bun_Payments_API

# Instalar dependencias
bun install

# Ejecutar en modo desarrollo
bun run dev
```

El servidor estará disponible en `http://localhost:3000`

### Con Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# En segundo plano
docker-compose up -d
```

## 📚 Endpoints API

### Health Check
```http
GET /health
```

### Servicios (Services)

#### Crear servicio
```http
POST /api/v1/services
Content-Type: application/json

{
  "name": "Internet",
  "amount": 49.99,
  "dueDate": 10,
  "category": "Utilidades"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": 1,
    "name": "Internet",
    "amount": 49.99,
    "dueDate": 10,
    "category": "Utilidades",
    "createdAt": 1714300000,
    "updatedAt": 1714300000
  }
}
```

#### Obtener todos los servicios
```http
GET /api/v1/services
```

#### Obtener servicio por ID
```http
GET /api/v1/services/:id
```

#### Actualizar servicio
```http
PUT /api/v1/services/:id
Content-Type: application/json

{
  "amount": 59.99,
  "dueDate": 15
}
```

#### Eliminar servicio
```http
DELETE /api/v1/services/:id
```

### Pagos (Payments)

#### Crear pagos mensuales
```http
POST /api/v1/payments/monthly?month=2026-04
```

#### Obtener pagos por mes
```http
GET /api/v1/payments/month?month=2026-04
```

#### Obtener resumen mensual
```http
GET /api/v1/payments/summary/month?month=2026-04
```

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2026-04",
    "totalToPay": 150.00,
    "totalPaid": 100.00,
    "totalPending": 50.00,
    "totalOverdue": 0.00,
    "balance": 50.00,
    "paymentsByStatus": {
      "paid": 2,
      "pending": 1,
      "overdue": 0
    }
  }
}
```

#### Actualizar estado de pago
```http
PUT /api/v1/payments/:id/status
Content-Type: application/json

{
  "status": "paid",
  "paymentMethod": "Transferencia",
  "paymentDate": 1714350000
}
```

#### Obtener historial de pagos por servicio
```http
GET /api/v1/payments/service/:serviceId
```

## 📊 Estructura del Proyecto

```
src/
├── index.ts                 # Punto de entrada principal
├── controllers/             # Lógica de controladores
│   ├── serviceController.ts
│   └── paymentController.ts
├── routes/                  # Definición de rutas
│   ├── services.ts
│   └── payments.ts
├── models/                  # Validaciones y tipos
│   └── validation.ts
├── middleware/              # Middlewares personalizados
│   ├── validation.ts
│   └── errorHandler.ts
├── db/                      # Configuración de base de datos
│   ├── index.ts
│   └── schema.ts
└── utils/                   # Utilidades
    └── errors.ts
```

## ✅ Estándares de Calidad

- **Linter/Formatter**: Biome con reglas estrictas
- **TypeScript**: Modo estricto (`strict: true`)
- **Cobertura mínima**: 80% líneas/funciones, 75% ramas
- **Pre-commit hooks**: lint + tests unitarios + type-check
- **CI/CD**: GitHub Actions (lint, test, security, build, docker)
- **Commits**: Conventional Commits validado
- **Dependencias**: Dependabot para actualizaciones automáticas

Todos los cambios pasan por el pipeline de CI antes de mergearse a `main`.

## 🔒 Validaciones

### Service (Crear/Actualizar)
- `name`: String (1-255 caracteres, único)
- `amount`: Number positivo
- `dueDate`: Integer (1-31)
- `category`: String (1-100 caracteres)

### Payment Status
- `status`: "pending" | "paid" | "overdue"
- `paymentMethod`: String (opcional)
- `paymentDate`: Integer Unix timestamp (opcional)

## 🐳 Docker

### Construir imagen
```bash
docker build -t bun-payments-api:1.0.0 .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -v $(pwd)/sqlite.db:/app/sqlite.db \
  bun-payments-api:1.0.0
```

### Con Docker Compose
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener
docker-compose down
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
bun run dev

# Build
bun run build

# Producción
bun run start

# Type checking
bun run type-check

# Linting & Formatting
bun run lint              # Verificar código con Biome
bun run format            # Formatear código
bun run format:check      # Verificar formato sin modificar

# Testing
bun run test              # Todos los tests con cobertura
bun run test:unit         # Tests unitarios
bun run test:integration  # Tests de integración
bun run test:e2e          # Tests E2E
bun run test:coverage     # Reporte de cobertura detallado
bun run test:watch        # Modo watch

# Base de datos
bun run db:push      # Aplicar migraciones
bun run db:studio    # Abrir Drizzle Studio
```

## 📝 Ejemplo de Uso Completo

```bash
# 1. Crear servicios
curl -X POST http://localhost:3000/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 12.99,
    "dueDate": 5,
    "category": "Entretenimiento"
  }'

# 2. Crear pagos del mes actual
curl -X POST "http://localhost:3000/api/v1/payments/monthly?month=2026-04"

# 3. Obtener resumen del mes
curl http://localhost:3000/api/v1/payments/summary/month?month=2026-04

# 4. Marcar pago como completado
curl -X PUT http://localhost:3000/api/v1/payments/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paymentMethod": "Tarjeta de Crédito"
  }'
```

## 🔐 Variables de Entorno

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=sqlite.db
```

## 📦 Dependencias Principales

- **Hono**: Framework web ultra-ligero
- **Drizzle ORM**: ORM type-safe para TypeScript
- **Zod**: Validación de esquemas con tipos
- **Bun SQLite**: Base de datos SQLite integrada en Bun

## 🚀 Despliegue

### Vercel
```bash
# Se requiere archivo vercel.json
bunx vercel deploy
```

### Railway
```bash
# Conectar repositorio de GitHub
# Configurar PORT=3000
railway up
```

### DigitalOcean App Platform
```bash
# Usar Dockerfile
doctl apps create --spec app.yaml
```

## 📄 Licencia

MIT

## 👤 Autor

Josue David

---

Para más información o reportar problemas, por favor crea un issue en el repositorio.
