import express from "express";
import cors from "cors";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { createGame, scoreGame } from "./games.js";
export function createApp(
  pool,
  { origins = ["http://localhost:5173"], teacherKey } = {},
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || origins.includes(origin)) return cb(null, true);
        const error = new Error("Origen no permitido.");
        error.status = 403;
        cb(error);
      },
      allowedHeaders: ["Content-Type", "X-Teacher-Key"],
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  function teacher(req, res, next) {
    const sent = Buffer.from(req.get("X-Teacher-Key") || "");
    const expected = Buffer.from(teacherKey || "");
    if (
      !expected.length ||
      sent.length !== expected.length ||
      !timingSafeEqual(sent, expected)
    )
      return res.status(401).json({ error: "Clave docente incorrecta." });
    next();
  }
  const validId = (v) =>
    /^\d+$/.test(String(v)) && Number(v) > 0 && Number(v) <= 4294967295;
  app.get("/api/salud", async (req, res) => {
    await pool.query("SELECT 1");
    res.json({ estado: "ok", baseDatos: "MySQL" });
  });
  app.get("/api/actividades", async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM actividades ORDER BY orden");
    res.json(rows);
  });
  app.post("/api/estudiantes", async (req, res) => {
    const nombre =
      typeof req.body?.nombre === "string"
        ? req.body.nombre.trim().replace(/\s+/g, " ")
        : "";
    const edad = req.body?.edad;
    if (
      nombre.length < 2 ||
      nombre.length > 100 ||
      !Number.isInteger(edad) ||
      edad < 3 ||
      edad > 17
    )
      return res
        .status(400)
        .json({
          error:
            "Escribe un nombre de 2 a 100 caracteres y una edad de 3 a 17 años.",
        });
    const [r] = await pool.execute(
      "INSERT INTO estudiantes(nombre,edad) VALUES(?,?)",
      [nombre, edad],
    );
    res.status(201).json({ id: r.insertId, nombre, edad });
  });
  app.get("/api/estudiantes", teacher, async (req, res) => {
    const [rows] = await pool.query(
      "SELECT id,nombre,edad FROM estudiantes ORDER BY nombre,id",
    );
    res.json(rows);
  });
  app.post("/api/partidas", async (req, res) => {
    const { estudiante_id, actividad_id } = req.body || {};
    if (!validId(estudiante_id) || !validId(actividad_id))
      return res
        .status(400)
        .json({ error: "Selecciona un estudiante y una actividad." });
    const [[student]] = await pool.execute(
      "SELECT id FROM estudiantes WHERE id=?",
      [estudiante_id],
    );
    const [[activity]] = await pool.execute(
      "SELECT codigo FROM actividades WHERE id=?",
      [actividad_id],
    );
    if (!student || !activity)
      return res
        .status(404)
        .json({ error: "Estudiante o actividad no encontrado." });
    const id = randomUUID(),
      contenido = createGame(activity.codigo);
    await pool.execute(
      "INSERT INTO partidas(id,estudiante_id,actividad_id,contenido) VALUES(?,?,?,?)",
      [id, estudiante_id, actividad_id, JSON.stringify(contenido)],
    );
    res.status(201).json({ id, ...contenido });
  });
  app.post("/api/resultados", async (req, res) => {
    const { partida_id, respuestas } = req.body || {};
    if (typeof partida_id !== "string" || !/^[0-9a-f-]{36}$/.test(partida_id))
      return res.status(400).json({ error: "Partida inválida." });
    const [[existing]] = await pool.execute(
      "SELECT * FROM resultados WHERE partida_id=?",
      [partida_id],
    );
    if (existing) return res.json(existing);
    const [[partida]] = await pool.execute(
      "SELECT *,TIMESTAMPDIFF(SECOND,creado_en,UTC_TIMESTAMP()) AS segundos FROM partidas WHERE id=?",
      [partida_id],
    );
    if (!partida)
      return res.status(404).json({ error: "No se encontró la partida." });
    let score;
    try {
      score = scoreGame(
        typeof partida.contenido === "string"
          ? JSON.parse(partida.contenido)
          : partida.contenido,
        respuestas,
      );
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    await pool.execute(
      "INSERT INTO resultados(partida_id,estudiante_id,actividad_id,puntaje,aciertos,intentos,total,duracion_segundos) VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE partida_id=VALUES(partida_id)",
      [
        partida_id,
        partida.estudiante_id,
        partida.actividad_id,
        score.puntaje,
        score.aciertos,
        score.intentos,
        score.total,
        Math.max(0, partida.segundos),
      ],
    );
    const [[saved]] = await pool.execute(
      "SELECT * FROM resultados WHERE partida_id=?",
      [partida_id],
    );
    res.status(201).json(saved);
  });
  app.get("/api/resultados", teacher, async (req, res) => {
    const { estudiante_id } = req.query;
    if (estudiante_id && !validId(estudiante_id))
      return res.status(400).json({ error: "Estudiante inválido." });
    const page = Math.max(1, Math.min(100000, parseInt(req.query.pagina) || 1)),
      limit = 25;
    const where = estudiante_id ? "WHERE r.estudiante_id=?" : "";
    const params = estudiante_id ? [Number(estudiante_id)] : [];
    const [rows] = await pool.execute(
      `SELECT r.*,e.nombre AS estudiante,a.nombre AS actividad,a.nivel FROM resultados r JOIN estudiantes e ON e.id=r.estudiante_id JOIN actividades a ON a.id=r.actividad_id ${where} ORDER BY r.fecha DESC,r.id DESC LIMIT 25 OFFSET ${(page - 1) * limit}`,
      params,
    );
    const [[summary]] = await pool.execute(
      `SELECT COUNT(*) AS partidas,COALESCE(ROUND(AVG(r.puntaje),1),0) AS promedio,COALESCE(SUM(r.aciertos),0) AS aciertos FROM resultados r ${where}`,
      params,
    );
    res.json({
      resultados: rows,
      resumen: summary,
      pagina: page,
      paginas: Math.max(1, Math.ceil(summary.partidas / limit)),
    });
  });
  app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada." }));
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ error: "JSON inválido." });
    console.error(error.code || error.message);
    res
      .status(error.status || 500)
      .json({
        error: error.status
          ? error.message
          : "No se pudo completar la solicitud. Revisa la conexión del servidor con MySQL.",
      });
  });
  return app;
}
