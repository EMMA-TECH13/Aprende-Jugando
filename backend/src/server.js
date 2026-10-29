import "dotenv/config";
import { pool } from "./db.js";
import { createApp } from "./app.js";
if (!process.env.TEACHER_KEY || process.env.TEACHER_KEY.startsWith("CAMBIAR")) {
  console.error("Configura TEACHER_KEY en backend/.env antes de iniciar.");
  process.exit(1);
}
try {
  await pool.query("SET time_zone = '+00:00'");
  await pool.query("SELECT id FROM actividades LIMIT 1");
  const app = createApp(pool, {
    origins: (process.env.CORS_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim()),
    teacherKey: process.env.TEACHER_KEY,
  });
  const server = app.listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
    console.log(
      `API disponible en http://localhost:${process.env.PORT || 3001}/api/salud`,
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        await pool.end();
        process.exit(0);
      }),
    );
} catch (error) {
  console.error(
    "No se pudo conectar a MySQL. Importa database/01_schema.sql y revisa backend/.env.",
  );
  console.error(error.code || error.message);
  process.exit(1);
}
