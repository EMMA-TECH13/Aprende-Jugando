import test from "node:test";
import assert from "node:assert/strict";
import { createGame, scoreGame, fraction } from "../src/games.js";
test("espacio cubre los ocho conceptos y figuras las cuatro formas", () => {
  const spatial = createGame("espacio");
  assert.equal(spatial.questions.length, 8);
  assert.equal(
    new Set(spatial.questions.map((q) => q.visual.position)).size,
    8,
  );
  assert.equal(
    new Set(createGame("figuras").questions.map((q) => q.visual.shape)).size,
    4,
  );
});
test("preguntas aleatorias: alternativas únicas y resultados matemáticos exactos", () => {
  for (let run = 0; run < 100; run++)
    for (const code of [
      "espacio",
      "figuras",
      "tablas",
      "fracciones",
      "decimales",
    ]) {
      const game = createGame(code);
      for (const q of game.questions) {
        assert.equal(new Set(q.options).size, q.options.length);
        assert.ok(q.correct >= 0 && q.correct < q.options.length);
        const answer = q.options[q.correct];
        if (code === "tablas") {
          const [a, b] = q.prompt.match(/\d+/g).map(Number);
          assert.equal(answer, String(a * b));
        }
        if (code === "decimales") {
          const [a, b] = q.prompt
            .match(/\d+\.\d+/g)
            .map((v) => Number(v.replace(".", "")));
          assert.equal(answer, ((a * b) / 100).toFixed(2));
        }
        if (code === "fracciones") {
          const { a, b, c, d } = q.visual;
          assert.equal(answer, fraction(a * d + c * b, b * d));
        }
      }
      assert.equal(
        scoreGame(
          game,
          game.questions.map((q) => q.correct),
        ).puntaje,
        100,
      );
      assert.equal(
        scoreGame(
          game,
          game.questions.map((q) => (q.correct + 1) % q.options.length),
        ).puntaje,
        0,
      );
    }
});
test("rechaza respuestas parciales y opciones fuera del rango", () => {
  const g = createGame("tablas");
  assert.throws(() => scoreGame(g, []));
  assert.throws(() => scoreGame(g, Array(10).fill(99)));
  assert.throws(() => scoreGame(g, Array(10).fill("0")));
});
test("memoria: pares válidos, puntaje e intentos adicionales", () => {
  const g = createGame("memoria"),
    pairs = [];
  for (const s of new Set(g.cards))
    pairs.push(g.cards.map((v, i) => (v === s ? i : -1)).filter((i) => i >= 0));
  assert.equal(pairs.length, 6);
  assert.deepEqual(scoreGame(g, pairs), {
    aciertos: 6,
    intentos: 6,
    total: 6,
    puntaje: 100,
  });
  const wrong = [pairs[0][0], pairs[1][0]];
  assert.equal(scoreGame(g, [wrong, ...pairs]).puntaje, 86);
  assert.throws(() => scoreGame(g, [[0, 0]]));
  assert.throws(() => scoreGame(g, [pairs[0], pairs[0], ...pairs.slice(1)]));
  assert.throws(() => scoreGame(g, pairs.slice(1)));
});
