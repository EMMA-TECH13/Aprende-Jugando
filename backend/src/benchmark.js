import "dotenv/config";
import { performance } from "node:perf_hooks";
const base =
  process.env.BENCHMARK_API_URL ||
  `http://localhost:${process.env.PORT || 3001}/api`;
const key = process.env.TEACHER_KEY;
if (!key) {
  console.error("Falta TEACHER_KEY en .env.");
  process.exit(1);
}
let failed = false;
for (const path of ["/salud", "/actividades", "/estudiantes", "/resultados"]) {
  const times = [];
  for (let i = 0; i < 31; i++) {
    const t = performance.now();
    const r = await fetch(base + path, { headers: { "X-Teacher-Key": key } });
    await r.text();
    if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
    if (i > 0) times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length,
    max = times.at(-1),
    p95 = times[Math.ceil(times.length * 0.95) - 1];
  console.log(
    `${path}: promedio=${avg.toFixed(1)} ms; p95=${p95.toFixed(1)} ms; máximo=${max.toFixed(1)} ms; ${max < 500 ? "CUMPLE en esta medición" : "REVISAR: supera 500 ms"}`,
  );
  if (max >= 500) failed = true;
}
process.exitCode = failed ? 1 : 0;
