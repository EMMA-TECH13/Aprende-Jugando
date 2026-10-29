import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
test("API: validaciones, acceso docente y CORS antes de consultar MySQL", async (t) => {
  const pool = {
    query() {
      throw new Error("Consulta no esperada");
    },
    execute() {
      throw new Error("Consulta no esperada");
    },
  };
  const server = createApp(pool, {
    teacherKey: "clave-de-prueba",
    origins: ["http://localhost:5173"],
  }).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/api`;
  for (const path of ["/estudiantes", "/resultados"]) {
    const r = await fetch(url + path);
    assert.equal(r.status, 401);
  }
  const invalid = await fetch(url + "/estudiantes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: "A", edad: 2 }),
  });
  assert.equal(invalid.status, 400);
  const invalidResult = await fetch(url + "/resultados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partida_id: "incorrecto" }),
  });
  assert.equal(invalidResult.status, 400);
  const denied = await fetch(url + "/actividades", {
    headers: { Origin: "https://origen-ajeno.example" },
  });
  assert.equal(denied.status, 403);
  const preflight = await fetch(url + "/actividades", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "GET",
    },
  });
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "http://localhost:5173",
  );
});
