# Catálogo de productos API

Primera mitad de la actividad: API REST con PostgreSQL, registro/login con JWT, roles y CRUD de productos.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación

```bash
npm install
copy .env.example .env
```

Configura `DATABASE_URL` y `JWT_SECRET` en `.env`. Luego crea la base de datos `catalogo_db` y ejecuta:

```bash
npm run db:init
npm run db:seed
npm start
```

El administrador local de desarrollo es `admin@example.com` con contraseña `Admin1234!`; cambia esta credencial en un entorno real.

## Rutas implementadas

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/auth/registro` | Público; siempre crea rol `usuario` |
| POST | `/api/auth/login` | Público; entrega JWT |
| GET | `/api/productos` | Público; acepta `?category=` |
| GET | `/api/productos/:id` | Público |
| POST | `/api/productos` | Administrador |
| PUT | `/api/productos/:id` | Administrador |
| DELETE | `/api/productos/:id` | Administrador |

Los endpoints administrativos reciben `Authorization: Bearer <token>`. Las consultas usan parámetros de PostgreSQL y las respuestas no exponen hashes.

## Decisiones

Se eligió PostgreSQL porque sus restricciones `UNIQUE` y `CHECK` ayudan a mantener la integridad de usuarios y precios; además, `pg` permite consultas parametrizadas.

## Alcance pendiente

Consulta `PENDIENTE.md` para la parte que debe completar el segundo integrante.
