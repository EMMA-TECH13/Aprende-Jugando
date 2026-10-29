# Ejecución y publicación

Esta entrega contiene configuración para publicar, pero aún NO se desplegó en internet ni existe una URL pública verificada.

## Opción A: servicios separados

Se necesita un alojamiento que ejecute Node.js de forma persistente, un servidor MySQL compatible y alojamiento estático para React.

1. Importa `database/01_schema.sql` en el servidor MySQL. Si el proveedor asigna el nombre de la base, selecciona esa base y omite las instrucciones `CREATE DATABASE` y `USE` del archivo.
2. Configura en el servicio backend `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `TEACHER_KEY`, `PORT` y `CORS_ORIGINS`.
3. Si MySQL requiere TLS, configura `DB_SSL=true`. Para proveedores con CA propia, adapta `db.js` a su certificado; no desactives la verificación del certificado.
4. Instala el backend con `npm ci --omit=dev` y arráncalo con `npm start` desde `backend`.
5. Configura `VITE_API_URL` con la URL HTTPS del backend terminada en `/api` ANTES de compilar el frontend.
6. Ejecuta `npm ci` y `npm run build` desde `frontend`. Publica el contenido de `frontend/dist`.
7. En `CORS_ORIGINS` escribe el origen HTTPS exacto del frontend, sin barra final. Separa varios orígenes por comas.
8. Prueba registro, juegos, guardado, acceso docente y filtro desde la URL pública. Usa HTTPS para la página y la API.

El archivo `.env` del frontend no contiene contraseñas. Las variables que comienzan con `VITE_` se incorporan al código público; no pongas ahí la clave docente ni contraseñas MySQL.

## Opción B: Docker Compose

La configuración incluida ejecuta tres servicios separados: frontend servido por Nginx, API Express y MySQL 8.4 con volumen persistente. Requiere Docker con Compose.

Desde la raíz del proyecto:

1. Copia `.env.docker.example` como `.env` y reemplaza las tres claves.
2. Ejecuta `docker compose up --build -d`.
3. Abre http://localhost:8080.
4. Consulta errores con `docker compose logs backend` o `docker compose logs db`.
5. Detén los servicios con `docker compose down`. Los datos permanecen en el volumen. `docker compose down -v` ELIMINA el volumen; no lo uses si necesitas conservar las partidas.

La base se inicializa automáticamente solo al crear un volumen vacío. Si cambias el script posteriormente, aplica los cambios a la base existente de forma explícita.

Para un servidor en internet, coloca un proxy HTTPS delante de `127.0.0.1:8080`, configura dominio/certificado y cambia `CORS_ORIGINS` al dominio HTTPS. El puerto de MySQL no se publica hacia internet. La configuración HTTP local no constituye por sí sola una publicación final.

Los archivos Docker están preparados, pero no se ejecutaron en el entorno de generación porque no hay Docker ni MySQL disponibles.

## Antes de entregar

- Reiniciar los servicios y comprobar que los resultados permanecen.
- Probar la URL desde otra computadora o teléfono.
- Ejecutar `npm run test:integration` contra el backend publicado mediante `BENCHMARK_API_URL` si corresponde.
- Medir `npm run benchmark` contra la URL publicada y conservar resultados.
- Añadir URL y capturas reales al informe.
- Generar el ZIP final sin `node_modules`, `.env`, contraseñas ni registros personales.

No es necesario contratar un servicio antes de verificar el proyecto localmente. La elección de proveedor y cualquier gasto siguen pendientes.
