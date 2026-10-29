import "dotenv/config";
import assert from "node:assert/strict";
const base =
  process.env.BENCHMARK_API_URL ||
  `http://localhost:${process.env.PORT || 3001}/api`;
async function request(path, method = "GET", body) {
  const r = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Teacher-Key": process.env.TEACHER_KEY || "",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  assert.ok(r.ok, JSON.stringify(data));
  return data;
}
const student = await request("/estudiantes", "POST", {
  nombre: `Prueba integración ${Date.now()}`,
  edad: 8,
});
const activities = await request("/actividades");
assert.equal(activities.length, 6);
for (const a of activities) {
  const game = await request("/partidas", "POST", {
    estudiante_id: student.id,
    actividad_id: a.id,
  });
  const respuestas =
    game.type === "quiz"
      ? game.questions.map((q) => q.correct)
      : [...new Set(game.cards)].map((shape) =>
          game.cards
            .map((v, i) => (v === shape ? i : -1))
            .filter((i) => i >= 0),
        );
  const payload = { partida_id: game.id, respuestas };
  const result = await request("/resultados", "POST", payload);
  assert.equal(result.puntaje, 100);
  const again = await request("/resultados", "POST", payload);
  assert.equal(result.id, again.id);
  console.log(`OK: ${a.nombre}, guardado y reenvío sin duplicar.`);
}
const history = await request(`/resultados?estudiante_id=${student.id}`);
assert.equal(history.resumen.partidas, 6);
assert.ok(history.resultados.every((r) => r.estudiante_id === student.id));
console.log(
  `OK: filtro de estudiante #${student.id}, 6 partidas. Esta prueba conserva sus datos para verificar persistencia después de reiniciar.`,
);
