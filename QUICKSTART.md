# 🚀 Quick Start Guide

## 📦 Instalación (2 minutos)

```bash
cd Bun_Payments_API
bun install
```

## 🏃 Ejecutar Localmente

### Modo Desarrollo (con hot reload)
```bash
bun run dev
```
El servidor estará en: `http://localhost:3000`

### Modo Producción
```bash
bun run build
bun run start
```

## 🧪 Probar la API

### Con el script de prueba
```bash
bash test-api.sh
```

### Manualmente con curl

```bash
# 1. Verificar que está vivo
curl http://localhost:3000/health

# 2. Crear un servicio
curl -X POST http://localhost:3000/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 12.99,
    "dueDate": 5,
    "category": "Entretenimiento"
  }'

# 3. Listar servicios
curl http://localhost:3000/api/v1/services

# 4. Crear pagos del mes
curl -X POST "http://localhost:3000/api/v1/payments/monthly?month=2026-04"

# 5. Ver resumen del mes
curl "http://localhost:3000/api/v1/payments/summary/month?month=2026-04"

# 6. Marcar pago como pagado (cambiar ID según necesites)
curl -X PUT http://localhost:3000/api/v1/payments/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paymentMethod": "Tarjeta de Crédito"
  }'
```

## 🐳 Docker

### Ejecutar con Docker Compose
```bash
docker-compose up --build
```

Acceder en: `http://localhost:3000`

### Ejecutar contenedor manualmente
```bash
# Construir
docker build -t bun-payments-api:1.0.0 .

# Ejecutar
docker run -p 3000:3000 \
  -v $(pwd)/sqlite.db:/app/sqlite.db \
  bun-payments-api:1.0.0
```

## 📁 Estructura Principal

```
src/
├── index.ts                    # Aplicación principal
├── controllers/serviceController.ts
├── controllers/paymentController.ts
├── routes/services.ts
├── routes/payments.ts
├── models/validation.ts
├── middleware/validation.ts
├── middleware/errorHandler.ts
├── db/schema.ts
├── db/index.ts
└── utils/errors.ts
```

## 🔑 Endpoints Principales

### Services (Servicios)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/services` | Crear servicio |
| GET | `/api/v1/services` | Listar todos |
| GET | `/api/v1/services/:id` | Obtener uno |
| PUT | `/api/v1/services/:id` | Actualizar |
| DELETE | `/api/v1/services/:id` | Eliminar |

### Payments (Pagos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/payments/monthly?month=2026-04` | Crear pagos mensuales |
| GET | `/api/v1/payments/month?month=2026-04` | Listar pagos por mes |
| GET | `/api/v1/payments/summary/month?month=2026-04` | Ver resumen |
| PUT | `/api/v1/payments/:id/status` | Cambiar estado pago |
| GET | `/api/v1/payments/service/:serviceId` | Historial servicio |

## 💾 Ejemplo de Datos

### Crear Servicio
```json
POST /api/v1/services
{
  "name": "Internet",
  "amount": 49.99,
  "dueDate": 10,
  "category": "Utilidades"
}
```

### Actualizar Estado Pago
```json
PUT /api/v1/payments/1/status
{
  "status": "paid",
  "paymentMethod": "Transferencia Bancaria"
}
```

## 🛠️ Scripts Útiles

```bash
bun run dev              # Desarrollo (hot reload)
bun run build            # Compilar TypeScript
bun run start            # Ejecutar compilado
bun run type-check       # Validar tipos
bun run db:push          # Sincronizar BD
```

## 🔍 Verificación Rápida

1. **¿El servidor está corriendo?**
   ```bash
   curl http://localhost:3000/health
   ```

2. **¿Hay servicios?**
   ```bash
   curl http://localhost:3000/api/v1/services
   ```

3. **¿Los errores son claros?**
   ```bash
   curl -X POST http://localhost:3000/api/v1/services \
     -H "Content-Type: application/json" \
     -d '{"name": "Test"}'  # Falta amount, dueDate, category
   ```

## 🆘 Troubleshooting

### Puerto ocupado
```bash
# Usar otro puerto
PORT=3001 bun run dev
```

### BD corrupta
```bash
# Eliminar y recrear
rm sqlite.db*
bun run dev
```

### Errores de tipos
```bash
bun run type-check
```

### Ver logs del servidor
```bash
# Ya está integrado, verás en consola
bun run dev
```

## 📚 Documentación Completa

- `README.md` - Documentación principal
- `DEVELOPING.md` - Guía para desarrollo
- `SUMMARY.md` - Resumen técnico completo
- `openapi.json` - Especificación OpenAPI

## ✅ Checklist de Desarrollo

- [ ] Servidor corriendo sin errores
- [ ] Crear un servicio exitosamente
- [ ] Listar servicios
- [ ] Crear pagos mensuales
- [ ] Ver resumen mensual
- [ ] Actualizar estado de pago
- [ ] Ver historial de pagos

## 🚀 Siguientes Pasos

1. **Leer documentación**: `README.md` para entender mejor la API
2. **Explorar código**: Ver `DEVELOPING.md` para estructuras
3. **Crear más funcionalidad**: Usar ejemplos de controllers
4. **Desplegar**: Usar Docker o servicios cloud

## 📞 Preguntas?

Revisa la documentación específica:
- Funcionamiento → `README.md`
- Desarrollo → `DEVELOPING.md`
- API completa → `openapi.json`
- Técnico → `SUMMARY.md`

---

**¡Lista para empezar!** 🎉
