# Estado de la actividad

## Trabajo realizado

- Se creó el proyecto Node.js con Express.
- Se configuró PostgreSQL mediante `pg` y variables de entorno.
- Se creó el esquema de usuarios y productos.
- Se implementó el registro público de usuarios con rol `usuario`.
- Se implementó el inicio de sesión con contraseña cifrada mediante bcrypt.
- Se implementó la generación y verificación de tokens JWT con vencimiento.
- Se implementó el middleware de autenticación y autorización para administradores.
- Se implementó el listado público de productos.
- Se implementó el filtro de productos por categoría.
- Se implementó la consulta de un producto por identificador.
- Se implementó el CRUD administrativo de productos.
- Se agregaron validaciones de campos obligatorios y precio mayor que cero.
- Se agregaron respuestas JSON y códigos HTTP para errores comunes.
- Se creó un script de inicialización de base de datos.
- Se creó un script de carga con un administrador y cinco productos ficticios.
- Se creó `README.md`, `.env.example`, `.gitignore` y el archivo de bloqueo de dependencias.
- Se crearon las ramas `main`, `feature/parte-1-backend` y `feature/parte-2-favoritos`.
- Se publicó el proyecto en GitHub.

## Trabajo pendiente

1. Crear la tabla `favorites` con relaciones entre usuarios y productos y una restricción contra duplicados.
2. Implementar `GET /api/favoritos`, `POST /api/favoritos` y `DELETE /api/favoritos/:productoId`.
3. Asegurar que cada usuario solo pueda consultar y eliminar sus propios favoritos.
4. Definir y probar qué ocurre con los favoritos al eliminar un producto.
5. Crear la colección de Postman y el entorno de ejemplo sin secretos.
6. Agregar aserciones para registro, login, duplicados, validaciones, errores `401`, `403`, `404` y `409`.
7. Probar el aislamiento entre dos usuarios y la persistencia después de reiniciar el servidor.
8. Completar el README con favoritos, pruebas y pasos de verificación final.
9. Grabar el video de 10 a 15 minutos con la participación de ambos integrantes.
10. Completar la portada y el PDF de entrega con nombres, asignatura, docente, enlaces, commit final, aportes y tabla de pruebas.
11. Hacer una instalación desde una copia limpia y comprobar los enlaces antes de entregar.
