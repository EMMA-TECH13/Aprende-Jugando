export const random = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = random(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
export function fraction(n, d) {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}
function question(
  prompt,
  answer,
  alternatives,
  visual = null,
  explanation = "",
) {
  const options = shuffle([...new Set([answer, ...alternatives])]).slice(0, 4);
  if (!options.includes(answer))
    options[random(0, options.length - 1)] = answer;
  return {
    prompt,
    options,
    correct: options.indexOf(answer),
    visual,
    explanation,
  };
}
const shapes = ["Círculo", "Cuadrado", "Triángulo", "Rectángulo"];
// Genera el contenido aleatorio que se conserva en MySQL.
export function createGame(code) {
  if (code === "memoria")
    return {
      type: "memory",
      cards: shuffle(
        [...shapes, "Estrella", "Rombo"].flatMap((shape) => [shape, shape]),
      ),
    };
  let questions = [];
  if (code === "espacio") {
    const pairs = [
      ["Adentro", "Afuera"],
      ["Arriba", "Abajo"],
      ["Cerca", "Lejos"],
      ["Encima", "Debajo"],
    ];
    questions = shuffle(
      pairs.flatMap((pair) =>
        pair.map((position) =>
          question(
            "¿Dónde está el círculo azul?",
            position,
            pair,
            { kind: "space", position },
            `El círculo está ${position.toLowerCase()} ${["Cerca", "Lejos"].includes(position) ? "del cuadrado." : ["Encima", "Debajo"].includes(position) ? "de la barra." : ["Arriba", "Abajo"].includes(position) ? "del cuadrado." : "del recuadro."}`,
          ),
        ),
      ),
    );
  } else if (code === "figuras") {
    questions = shuffle([...shapes, ...shapes]).map((shape) =>
      question(
        "¿Cómo se llama esta figura?",
        shape,
        shapes,
        { kind: "shape", shape },
        `Esta figura es un ${shape.toLowerCase()}.`,
      ),
    );
  } else if (code === "tablas") {
    questions = Array.from({ length: 10 }, () => {
      const a = random(1, 10),
        b = random(1, 10),
        n = a * b;
      return question(
        `${a} × ${b} = ?`,
        String(n),
        [n + a, n + 1, Math.max(0, n - b)].map(String),
        null,
        `${a} × ${b} = ${n}.`,
      );
    });
  } else if (code === "fracciones") {
    questions = Array.from({ length: 10 }, (_, i) => {
      const b = random(2, 9),
        d = i < 4 ? b : random(2, 9),
        a = random(1, b - 1),
        c = random(1, d - 1),
        n = a * d + c * b,
        den = b * d;
      return question(
        `${a}/${b} + ${c}/${d} = ?`,
        fraction(n, den),
        [fraction(n + 1, den), fraction(n + 2, den), fraction(n + 3, den)],
        { kind: "fraction", a, b, c, d },
        `Usamos denominador común: (${a} × ${d} + ${c} × ${b}) / (${b} × ${d}) = ${n}/${den} = ${fraction(n, den)}.`,
      );
    });
  } else if (code === "decimales") {
    questions = Array.from({ length: 10 }, () => {
      const a = random(11, 99),
        b = random(11, 49),
        n = a * b;
      return question(
        `${(a / 10).toFixed(1)} × ${(b / 10).toFixed(1)} = ?`,
        (n / 100).toFixed(2),
        [(n + 10) / 100, (n + 100) / 100, (n + 1) / 100].map((x) =>
          x.toFixed(2),
        ),
        null,
        `${a} × ${b} = ${n}. Colocamos dos cifras decimales: ${(n / 100).toFixed(2)}.`,
      );
    });
  } else throw new Error("Actividad no reconocida.");
  return { type: "quiz", questions };
}
// Recalcula el resultado usando la partida guardada, no el puntaje del cliente.
export function scoreGame(game, answers) {
  if (!Array.isArray(answers)) throw new Error("Faltan las respuestas.");
  if (game.type === "quiz") {
    if (answers.length !== game.questions.length)
      throw new Error("Completa todas las preguntas.");
    let aciertos = 0;
    answers.forEach((a, i) => {
      if (
        !Number.isInteger(a) ||
        a < 0 ||
        a >= game.questions[i].options.length
      )
        throw new Error("Respuesta inválida.");
      if (a === game.questions[i].correct) aciertos++;
    });
    return {
      aciertos,
      intentos: answers.length,
      total: answers.length,
      puntaje: Math.round((aciertos / answers.length) * 100),
    };
  }
  if (answers.length > 500) throw new Error("Demasiados intentos.");
  const matched = new Set();
  for (const pair of answers) {
    if (!Array.isArray(pair) || pair.length !== 2)
      throw new Error("Par inválido.");
    const [a, b] = pair;
    if (
      !Number.isInteger(a) ||
      !Number.isInteger(b) ||
      a === b ||
      a < 0 ||
      b < 0 ||
      a >= game.cards.length ||
      b >= game.cards.length ||
      matched.has(a) ||
      matched.has(b)
    )
      throw new Error("Movimiento inválido.");
    if (game.cards[a] === game.cards[b]) {
      matched.add(a);
      matched.add(b);
    }
  }
  const total = game.cards.length / 2;
  if (matched.size !== game.cards.length)
    throw new Error("Encuentra todos los pares.");
  return {
    aciertos: total,
    intentos: answers.length,
    total,
    puntaje: Math.round((total / answers.length) * 100),
  };
}
