# Trabajo pendiente para completar la actividad

Este repositorio contiene la primera mitad implementada: PostgreSQL, usuarios, registro/login con JWT, control de rol administrador y CRUD de productos.

La segunda mitad debe completar y verificar:

1. Crear la tabla `favorites` con relación usuario-producto y restricción para evitar duplicados.
2. Implementar `GET /api/favoritos`, `POST /api/favoritos` y `DELETE /api/favoritos/:productoId`, usando siempre el usuario del JWT.
3. Definir y probar qué sucede con favoritos al eliminar productos.
4. Crear una colección de Postman y un entorno sin secretos con aserciones para todos los casos obligatorios: errores de validación, 401, 403, 404, 409, aislamiento entre usuarios y persistencia tras reiniciar.
5. Agregar la evidencia de pruebas y actualizar el README con los endpoints de favoritos.
6. Grabar el video de 10–15 minutos con participación de ambos integrantes y subirlo con acceso verificable.
7. Completar la portada/formato del estudiante con nombres, asignatura, docente y fecha; generar el PDF de entrega con enlaces, commit final, aportes y tabla de pruebas.
8. Hacer una revisión desde una copia limpia, verificar enlaces en ventana privada y registrar el commit final.
