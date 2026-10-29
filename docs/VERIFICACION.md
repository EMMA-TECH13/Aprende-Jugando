# Verificación de requisitos

Los estados distinguen implementación de comprobación contra servicios reales. No se ha verificado el PDF original en este turno; esta matriz corresponde al desglose compartido.

| Requisito | Implementación | Evidencia / pendiente |
|---|---|---|
| RF-01 Registro nombre y edad | POST /api/estudiantes, formulario y validaciones | Integración MySQL pendiente |
| RF-02 Juegos dinámicos | Seis generadores, orden y opciones aleatorios | Pruebas de lógica aprobadas |
| RF-03 Retroalimentación inmediata | Opciones correctas/incorrectas, explicación, pares | Revisión interactiva registrada abajo |
| RF-04 Puntaje en tiempo real | Marcador en Game.jsx y cálculo final del servidor | Pruebas de cálculo aprobadas |
| RF-05 POST de resultados a MySQL | INSERT parametrizado y reintentos idempotentes | Pendiente ejecutar test:integration con MySQL |
| RF-06 GET del historial | Consulta con JOIN, orden y paginación | Pendiente comprobar registros reales |
| RF-07 Catálogo desde MySQL | GET /api/actividades lee la tabla | Pendiente comprobar catálogo real |
| RF-08 Filtro por estudiante | Query string y WHERE parametrizado | Pendiente comprobar con MySQL |
| RNF-01 Interfaz infantil usable | Botones grandes, figuras, diseño adaptable | Validar además con usuarios destinatarios |
| RNF-02 Consultas menores a 500 ms | Pool, índices y script benchmark | NO medido contra MySQL ni hosting |
| RNF-03 CORS explícito | Lista de orígenes en variables de entorno | Prueba automática de origen permitido y rechazado aprobada |
| RNF-04 Integridad referencial | Tablas InnoDB con claves foráneas | Script preparado; ejecución MySQL pendiente |
| RNF-05 Arquitectura desacoplada | Carpetas y aplicaciones frontend/backend independientes | Verificada en el código |
| RNF-06 Node 18+ y MySQL 8+ | Proyecto usa Node 22.12+ y MySQL 8.0+ | Build en Node 24.19; MySQL pendiente |
| RNF-07 Código organizado | Componentes, API, base de datos, generadores y pruebas | Incluido |
| Publicación | Dockerfiles, Compose y guía de despliegue | Pendiente: no existe URL pública |
| ZIP con código/documentación | Código, lockfiles, SQL, env de ejemplo y guías | Incluido sin credenciales ni node_modules |

## Pruebas automatizadas realizadas

Comando: `npm test` en backend.

Resultado: 5 pruebas aprobadas, 0 fallidas.

Cobertura:

- Ocho relaciones espaciales y cuatro figuras.
- Cien rondas de generación para cada una de cinco actividades de preguntas.
- Respuestas y alternativas matemáticas verificadas.
- Puntajes 0 y 100; rechazo de respuestas incompletas o fuera de rango.
- Memoria: seis parejas, intento fallido, rechazo de tarjetas repetidas o inválidas.
- HTTP: acceso docente, entradas inválidas y CORS. Estas comprobaciones no usan una base de datos real.

Comando: `npm run build` en frontend.

Resultado: compilación de producción aprobada.

## Pruebas que debe completar la entrega final

1. Importar el SQL y ejecutar `npm run test:integration` con el backend conectado a MySQL.
2. Cerrar y volver a abrir frontend y backend; verificar los resultados en el panel.
3. Consultar en Workbench:

```sql
USE aprende_jugando;
SELECT * FROM actividades ORDER BY orden;
SELECT r.id,e.nombre,a.nombre AS actividad,r.puntaje,r.fecha
FROM resultados r
JOIN estudiantes e ON e.id=r.estudiante_id
JOIN actividades a ON a.id=r.actividad_id
ORDER BY r.id DESC;
```

4. Ejecutar `npm run benchmark`, guardar la salida y revisar el máximo por ruta.
5. Desconectar temporalmente la API después de terminar una partida, comprobar el mensaje de error y reintentar el guardado. Verificar que no se duplica.
6. Registrar dos estudiantes diferentes; comprobar que el filtro no mezcla sus resultados.
7. Verificar la clave docente incorrecta y correcta.
8. Publicar y repetir los flujos desde una segunda computadora.

No atribuir el resultado de una prueba simulada al motor MySQL o a un servicio publicado.

## Revisión de interfaz en este entorno

La compilación JSX/CSS se completó. Se preparó una prueba de navegación con datos simulados, pero el navegador de pruebas no pudo iniciarse en este entorno; por ello NO se reporta como aprobada ni se incluyen capturas simuladas. La navegación, distribución visual y flujos completos deben comprobarse al abrir la aplicación localmente.


## Actualización de preprimaria (28/10/2026)

Consultar `../ACTUALIZACION_PREPRIMARIA.md` para las pruebas nuevas, los límites de la simulación y la comprobación manual de audio pendiente.
