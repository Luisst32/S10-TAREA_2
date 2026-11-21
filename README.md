# Catálogo de productos API

API REST para catálogo de productos y favoritos personales. Incluye PostgreSQL, registro e inicio de sesión con JWT, autorización por roles y aislamiento de favoritos por usuario.

## Integrantes

- Luis Torres
- Compañero/a: completar nombre y aportes antes de entregar

## Propósito

Proporcionar un catálogo público, administración protegida por rol y favoritos privados. Se implementó PostgreSQL con `pg` porque ofrece integridad referencial, restricciones `UNIQUE`/`CHECK`, consultas parametrizadas y persistencia reiniciable.

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

La inicialización crea las tablas, el administrador local `admin@example.com` y cinco productos. Cambia las credenciales de ejemplo antes de usar la aplicación fuera de desarrollo.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP; predeterminado 3000 |
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Clave usada para firmar y verificar JWT |
| `JWT_EXPIRES_IN` | Vigencia del token, por ejemplo `2h` |

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
| GET | `/api/favoritos` | Usuario autenticado |
| POST | `/api/favoritos` | Usuario autenticado; cuerpo `{ "productId": 1 }` |
| DELETE | `/api/favoritos/:productoId` | Usuario autenticado |

## Cuerpos y respuestas

- Registro: `{ "name": "Usuario A", "email": "a@example.com", "password": "Clave1234!" }`
- Login: `{ "email": "a@example.com", "password": "Clave1234!" }`
- Producto: `{ "name": "Producto", "description": "Descripción", "category": "categoría", "price": 10.50 }`
- Respuestas exitosas usan JSON; eliminación de producto devuelve `204`.
- Errores usan `{ "error": "mensaje claro" }`. Se usa `400` para datos inválidos, `401` sin/por token inválido o vencido, `403` sin rol administrador, `404` para recursos inexistentes y `409` para duplicados.

## Persistencia e integridad

- Los favoritos usan clave primaria compuesta `(user_id, product_id)`.
- Al eliminar un producto o usuario, sus favoritos se eliminan automáticamente con `ON DELETE CASCADE`.
- Los datos permanecen en PostgreSQL al reiniciar Node.js.

## Ejecución de pruebas en Postman

1. Importe `postman/Entorno.catalogo.json` y `postman/Catalogo.postman_collection.json`.
2. Seleccione el entorno y configure `baseUrl`, sin secretos reales si usa el repositorio público.
3. Ejecute la colección en orden o las peticiones identificadas manualmente.
4. El registro público guarda el rol `usuario`; el administrador se crea únicamente con `npm run db:seed`.
5. La colección demuestra registro/login, duplicados, CRUD, filtros, validación, permisos, favoritos aislados y persistencia.

### Casos adicionales

- Para comprobar `401` por token vencido: reinicie el servidor temporalmente con `JWT_EXPIRES_IN=1ms`, haga login, espere unos segundos y llame a `GET /api/favoritos` con ese token.
- Para persistencia: detenga Node.js, ejecútelo de nuevo y repita `GET /api/productos` y `GET /api/favoritos`.
- Para aislamiento: complete los registros de usuario A y B, agregue el favorito con A y confirme que el listado y la eliminación de B no lo modifican.

## Interfaz gráfica

Con el servidor iniciado, abra `http://localhost:3000`.

La interfaz permite consultar el catálogo sin iniciar sesión, registrarse, iniciar sesión, gestionar favoritos, administrar productos con una cuenta administradora y ejecutar pruebas visuales de estados HTTP desde la pestaña **Pruebas**.
