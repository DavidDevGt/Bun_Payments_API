# Guía de Desarrollo - Bun Payments API

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas
```
src/
├── index.ts              # Punto de entrada y configuración de Hono
├── controllers/          # Lógica de negocio
├── routes/              # Definición de endpoints
├── models/              # Validaciones (Zod) y tipos TypeScript
├── middleware/          # Validación y manejo de errores
├── db/                  # Configuración de BD (Drizzle)
└── utils/              # Funciones de utilidad
```

## 🔄 Flujo de una Solicitud

1. **Request llega a Hono** → `src/index.ts`
2. **Middlewares globales** (logger, CORS)
3. **Router** dirige a la ruta específica
4. **Validación** con Zod (si existe)
5. **Controller** procesa la lógica
6. **Respuesta** como JSON

## 📝 Convenciones de Código

### Naming
- Archivos: `camelCase.ts`
- Funciones: `camelCase()`
- Clases: `PascalCase`
- Constantes: `UPPER_CASE`

### Manejo de Errores
Siempre lanzar excepciones heredadas de `AppError`:

```typescript
import { NotFoundError, ValidationError } from "../utils/errors";

throw new NotFoundError("Service");
throw new ValidationError("Invalid input");
```

### Tipos
Reutilizar tipos generados por Drizzle:

```typescript
import type { Service, NewService } from "../db/schema";
```

## 🚀 Agregar un Nuevo Endpoint

### 1. Crear el esquema de validación (opcional)
```typescript
// src/models/validation.ts
export const MyActionSchema = z.object({
  field: z.string().min(1),
});
export type MyActionInput = z.infer<typeof MyActionSchema>;
```

### 2. Crear el controlador
```typescript
// src/controllers/myController.ts
import { Context } from "hono";
import { MyActionInput } from "../models/validation";

export const myAction = async (c: Context, data?: MyActionInput) => {
  // Lógica aquí
  return c.json({ success: true, data: result });
};
```

### 3. Crear la ruta
```typescript
// src/routes/myRoutes.ts
import { Hono } from "hono";
import { myAction } from "../controllers/myController";
import { validateJSON } from "../middleware/validation";
import { MyActionSchema } from "../models/validation";

const myRoutes = new Hono();
myRoutes.post("/", validateJSON(MyActionSchema), async (c) => {
  const data = c.get("validated");
  return myAction(c, data);
});

export default myRoutes;
```

### 4. Registrar la ruta en index.ts
```typescript
import myRoutes from "./routes/myRoutes";
app.route("/api/v1/my-endpoint", myRoutes);
```

## 🗄️ Base de Datos

### Agregar una nueva tabla
```typescript
// src/db/schema.ts
export const myTable = sqliteTable("my_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
```

### Usar la tabla en un controlador
```typescript
import { db } from "../db";
import { myTable } from "../db/schema";
import { eq } from "drizzle-orm";

// Crear
const result = await db.insert(myTable).values({ name: "test" }).returning();

// Leer
const records = await db.query.myTable.findMany();
const single = await db.query.myTable.findFirst({
  where: eq(myTable.id, 1),
});

// Actualizar
await db.update(myTable)
  .set({ name: "updated" })
  .where(eq(myTable.id, 1))
  .returning();

// Eliminar
await db.delete(myTable).where(eq(myTable.id, 1));
```

## 📊 Queryds Útiles

### Obtener con relaciones
```typescript
const result = await db.query.myTable.findFirst({
  where: eq(myTable.id, 1),
  with: {
    relatedTable: true,
  },
});
```

### Filtros complejos
```typescript
import { and, or, like } from "drizzle-orm";

const results = await db.query.myTable.findMany({
  where: and(
    eq(myTable.status, "active"),
    or(
      like(myTable.name, "%test%"),
      like(myTable.name, "%example%")
    )
  ),
});
```

## 🧪 Testing

### Ejecutar tests manuales
```bash
# Script de prueba disponible
bash test-api.sh

# O con curl individual
curl -X GET http://localhost:3000/api/v1/services
```

### Estructura de respuesta exitosa
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Estructura de respuesta con error
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error message",
  "details": []
}
```

## 🔒 Validación

### Zod - Validadores útiles
```typescript
import { z } from "zod";

// Strings
z.string().min(1).max(255)
z.string().email()
z.string().url()
z.string().regex(/pattern/)

// Numbers
z.number().positive()
z.number().int()
z.number().min(0).max(100)

// Enums
z.enum(["option1", "option2"])

// Composición
z.object({
  name: z.string(),
  age: z.number().optional(),
}).strict() // No permitir campos extra

// Arrays
z.array(z.string())
z.array(z.object({ id: z.number() }))
```

## 📋 Logging

### Usar el logger integrado
```typescript
// El logger de Hono está habilitado globalmente
// Todos los requests/responses se registran automáticamente
```

### Logs personalizados
```typescript
console.log("[INFO]", message);
console.warn("[WARN]", message);
console.error("[ERROR]", message);
```

## 🚀 Despliegue Local vs Producción

### Variables de entorno
```env
# .env para desarrollo
PORT=3000
NODE_ENV=development

# En producción
NODE_ENV=production
```

### Build para producción
```bash
bun run build
bun run start
```

## 📦 Scripts npm Útiles

```bash
# Desarrollo
bun run dev              # Watch mode

# Build
bun run build            # Compilar a dist/

# Producción
bun run start            # Ejecutar build compilado

# Verificación
bun run type-check       # Validar tipos TypeScript

# Base de datos
bun run db:push          # Sincronizar esquema con BD
bun run db:studio        # Abrir Drizzle Studio (GUI)
```

## 🐛 Troubleshooting

### Puerto ya en uso
```bash
# Cambiar puerto
PORT=3001 bun run dev
```

### BD corrupta
```bash
# Eliminar y recrear
rm sqlite.db*
bun run dev
```

### Tipos incorrectos
```bash
# Verificar tipos
bun run type-check

# Limpiar y reconstruir
rm -rf dist && bun run build
```

## 📚 Recursos

- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod Documentation](https://zod.dev)
- [Bun Documentation](https://bun.sh)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🔍 Best Practices

1. **Validar siempre**: Usar Zod para entrada del usuario
2. **Manejo de errores**: Usar clases heredadas de AppError
3. **Tipos**: Reutilizar tipos de Drizzle
4. **Bases de datos**: Usar índices en columnas frecuentemente filtradas
5. **Logs**: Incluir contexto suficiente para debugging
6. **Tests**: Ejecutar test-api.sh antes de hacer commit
7. **Performance**: Usar índices en BD, evitar N+1 queries
8. **Security**: No loguear datos sensibles, validar todas las entradas
