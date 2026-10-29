# Proyecto: Aprende Jugando

**Estudiante:** [Completar]

**Carné:** [Completar]

**Curso:** [Completar]

**Docente:** [Completar]

**Fecha:** [Completar]

## 1. Introducción

Aprende Jugando es una aplicación web dirigida a estudiantes de preprimaria y primaria. Integra actividades de reconocimiento espacial, figuras geométricas, memoria y operaciones matemáticas. Su propósito es facilitar la práctica mediante retroalimentación inmediata y conservar los resultados para que un docente o tutor consulte el avance.

## 2. Objetivo general

Desarrollar una aplicación web de juegos educativos que registre estudiantes, presente actividades interactivas y permita consultar los resultados mediante un panel docente conectado a una base de datos MySQL.

## 3. Objetivos específicos

1. Diseñar una interfaz en español con controles grandes y navegación sencilla.
2. Implementar los ocho conceptos espaciales, cuatro figuras, memoria y tres temas matemáticos solicitados.
3. Comunicar React con Express mediante una API REST con CORS explícito.
4. Guardar resultados relacionados con cada estudiante y actividad mediante claves foráneas.
5. Consultar el historial y filtrar los resultados por estudiante.
6. Verificar la persistencia, el rendimiento y la ejecución de la aplicación publicada.

## 4. Alcance

El sistema registra nombre y edad; permite seleccionar un estudiante existente desde el panel docente; carga el catálogo desde la base de datos; genera partidas; valida respuestas; muestra puntajes y registra partidas terminadas. El panel muestra resultados con paginación, promedio y aciertos acumulados.

El sistema no incluye administración de centros educativos, cuentas individuales de docentes, recuperación de contraseñas, edición o eliminación de estudiantes, certificados ni exportación PDF. El acceso docente usa una clave de configuración compartida. Los nombres duplicados se distinguen mediante el identificador de estudiante.

## 5. Arquitectura

El navegador ejecuta React y CSS. React utiliza `fetch` para enviar solicitudes GET y POST a Express. Express valida los datos, genera preguntas, calcula los resultados y utiliza `mysql2` con consultas parametrizadas. MySQL almacena estudiantes, catálogo, partidas y resultados. Frontend y backend son aplicaciones separadas.

| Componente | Responsabilidad |
|---|---|
| React | Pantallas, interacción, retroalimentación, puntaje visible |
| Express | API REST, validación de entradas, cálculo al guardar y acceso docente |
| MySQL | Persistencia, relaciones, catálogo e historial |
| CORS | Autorizar orígenes concretos del frontend |

## 6. Modelo de datos

| Tabla | Clave primaria | Claves foráneas | Datos principales |
|---|---|---|---|
| estudiantes | id | — | nombre, edad, creado_en |
| actividades | id | — | codigo, nombre, nivel, descripcion, orden |
| partidas | id UUID | estudiante_id, actividad_id | contenido JSON, creado_en |
| resultados | id | partida_id, estudiante_id, actividad_id | puntaje, aciertos, intentos, total, duración, fecha |

Un estudiante puede tener muchas partidas; cada partida pertenece a un estudiante. Una actividad puede aparecer en muchas partidas; cada partida corresponde a una actividad. Una partida puede tener cero o un resultado; cada resultado pertenece a una partida. La restricción UNIQUE de `resultados.partida_id` evita resultados duplicados al reintentar un envío.

Se añadió `partidas` a las tres tablas iniciales para conservar las preguntas generadas y recalcular el resultado en el servidor. El puntaje enviado por el navegador no se toma como valor definitivo; se evalúan las respuestas recibidas.

## 7. Funcionamiento de los módulos

### Preprimaria

- **Espacio:** la voz pide tocar una escena con un gato en una posición determinada. Incluye adentro/afuera, arriba/abajo, cerca/lejos y encima/debajo. Se usan una caja y una mesa como referencias visibles.
- **Figuras:** la voz nombra una figura y el estudiante toca el dibujo correspondiente entre cuatro opciones de colores. Incluye círculo, cuadrado, triángulo y rectángulo.
- **Memoria:** mezcla doce tarjetas con seis parejas de animales. Al voltear una tarjeta se pronuncia su nombre. Las tarjetas diferentes se ocultan después de tres segundos.

Un adulto completa el registro. Un botón de inicio activa las instrucciones habladas y la bocina permite repetirlas. En espacio y figuras se puede corregir, pero el historial conserva la primera respuesta de cada reto. Las estrellas indican retos completados, no el puntaje. Las animaciones son breves y respetan la preferencia de movimiento reducido.

La voz usa SpeechSynthesis del navegador con preferencia por voces en español. La disponibilidad y pronunciación dependen del dispositivo. No se requiere micrófono. Si falla el audio se muestra un aviso para el adulto. Los animales se representan con caracteres emoji, cuyo aspecto también depende del sistema. Los identificadores internos de memoria conservan los nombres de figuras para mantener compatibilidad con el servidor; cada identificador corresponde a un animal distinto.

### Primaria

- **Tablas:** genera multiplicaciones con factores del 1 al 10.
- **Fracciones:** genera sumas con denominador igual en las primeras cuatro preguntas y denominadores variables en las restantes. Simplifica las respuestas usando el máximo común divisor.
- **Decimales:** utiliza enteros en centésimas para calcular productos exactos, evitando depender de comparaciones imprecisas de coma flotante.

## 8. API

| Método | Ruta | Función | Acceso |
|---|---|---|---|
| GET | /api/salud | Comprobar servidor y conexión MySQL | General |
| POST | /api/estudiantes | Registrar nombre y edad | General |
| GET | /api/estudiantes | Consultar estudiantes existentes | Clave docente |
| GET | /api/actividades | Consultar catálogo | General |
| POST | /api/partidas | Crear y guardar preguntas de la partida | General |
| POST | /api/resultados | Calcular y guardar una partida terminada | Identificador de partida |
| GET | /api/resultados | Historial paginado | Clave docente |
| GET | /api/resultados?estudiante_id=1 | Filtrar historial | Clave docente |

La clave se envía en `X-Teacher-Key` y se mantiene únicamente en memoria de la interfaz mientras se utiliza el panel. La URL base de la API se configura con `VITE_API_URL`; las credenciales MySQL permanecen en el backend.

## 9. Integridad y límites

Se validan nombres de 2 a 100 caracteres, edades enteras de 3 a 17, identificadores y respuestas. Las consultas utilizan parámetros; las claves foráneas relacionan los registros. El cálculo final no acepta un puntaje arbitrario del navegador.

Es una aplicación académica, no una plataforma de exámenes seguros: el navegador recibe las soluciones para ofrecer retroalimentación inmediata. El registro y la creación de partidas no requieren cuentas individuales. Antes de usar datos reales de niños en una instalación pública se necesitaría definir autenticación por usuario y permisos sobre cada estudiante.

## 10. Evidencias y pruebas

Consulta `VERIFICACION.md`. Agrega capturas de:

1. Registro de un estudiante de prueba.
2. Catálogo cargado desde MySQL.
3. Respuesta correcta y respuesta incorrecta.
4. Un ejemplo de cada juego.
5. Confirmación de guardado.
6. Panel filtrado por estudiante.
7. Registros en MySQL después de reiniciar.
8. Medición de consultas por debajo de 500 ms.
9. Aplicación funcionando desde la URL publicada.

No se deben presentar pruebas simuladas de interfaz como evidencia de persistencia real.

## 11. Estado de publicación

**URL:** [Pendiente de publicar]

**Prueba desde otra computadora:** [Pendiente]

**Fecha indicada en el desglose:** aplicación publicada el 3 de noviembre de 2026; presentación el 4 o 5 de noviembre. Confirmar contra el documento original.

## 12. Conclusión provisional

La implementación reúne los módulos educativos y la estructura de registro, API e historial. La aceptación final requiere ejecutar las pruebas de integración contra MySQL, documentar el rendimiento y verificar el despliegue público. Estas actividades deben completarse antes de considerar cerrado el proyecto.
