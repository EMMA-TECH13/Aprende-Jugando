import React, { useRef, useState } from "react";
import Visual, { Shape } from "./Visual";
import { api } from "../api";
// Controla las preguntas de primaria y el envío del resultado.
export default function Game({ game, activity, student, onExit }) {
  const [answers, setAnswers] = useState([]),
    [selected, setSelected] = useState(null),
    [flipped, setFlipped] = useState([]),
    [matched, setMatched] = useState([]),
    [complete, setComplete] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(null),
    [error, setError] = useState("");
  const lock = useRef(false);
  const memory = game.type === "memory";
  const q = memory ? null : game.questions[answers.length];
  const right = memory
    ? matched.length / 2
    : answers.filter((a, i) => a === game.questions[i].correct).length;
  const total = memory ? game.cards.length / 2 : game.questions.length;
  const score = memory
    ? answers.length
      ? Math.round((right / answers.length) * 100)
      : 0
    : Math.round(((right + (selected === q?.correct ? 1 : 0)) / total) * 100);
  async function save(finalAnswers) {
    setSaving(true);
    setError("");
    try {
      setSaved(
        await api("/resultados", {
          method: "POST",
          body: { partida_id: game.id, respuestas: finalAnswers },
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  function next() {
    if (lock.current || selected === null) return;
    lock.current = true;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (nextAnswers.length === total) {
      setComplete(true);
      save(nextAnswers);
    }
    queueMicrotask(() => (lock.current = false));
  }
  function flip(i) {
    if (
      lock.current ||
      flipped.length === 2 ||
      flipped.includes(i) ||
      matched.includes(i) ||
      complete
    )
      return;
    if (!flipped.length) {
      setFlipped([i]);
      return;
    }
    lock.current = true;
    const pair = [flipped[0], i],
      turns = [...answers, pair];
    setFlipped(pair);
    setAnswers(turns);
    if (game.cards[pair[0]] === game.cards[i]) {
      const found = [...matched, ...pair];
      setMatched(found);
      setFlipped([]);
      if (found.length === game.cards.length) {
        setComplete(true);
        save(turns);
      }
      queueMicrotask(() => (lock.current = false));
    }
  }
  function closeCards() {
    setFlipped([]);
    lock.current = false;
  }
  function exit() {
    if (
      !saved &&
      !window.confirm(
        "¿Salir de la partida? Los resultados que no se hayan guardado se perderán.",
      )
    )
      return;
    onExit();
  }
  if (complete)
    return (
      <section className="result panel">
        <div className="result-symbol">✓</div>
        <p className="eyebrow">PARTIDA TERMINADA</p>
        <h1>¡Buen trabajo, {student.nombre.split(" ")[0]}!</h1>
        <p>Practicar un poco cada día te ayuda a aprender.</p>
        <div className="big-score">
          {saved?.puntaje ?? score}
          <small>/ 100 puntos</small>
        </div>
        <div className="result-stats">
          <span>
            <b>
              {right} / {total}
            </b>
            {memory ? "Pares encontrados" : "Respuestas correctas"}
          </span>
          <span>
            <b>{answers.length}</b>
            {memory ? "Intentos" : "Preguntas"}
          </span>
        </div>
        <p role="status" className={error ? "error" : "save-status"}>
          {saving
            ? "Guardando tu resultado…"
            : saved
              ? "Tu resultado se guardó correctamente."
              : error}
        </p>
        {error && (
          <button onClick={() => save(answers)} disabled={saving}>
            Volver a guardar
          </button>
        )}
        <button className="primary" onClick={exit} disabled={saving}>
          Volver a los juegos
        </button>
      </section>
    );
  return (
    <section className="game panel">
      <div className="game-top">
        <button className="quiet" onClick={exit}>
          Salir de la partida
        </button>
        <span className="score">{score} puntos</span>
      </div>
      <p className="eyebrow">{activity.nombre}</p>
      <div
        className="progress"
        role="progressbar"
        aria-label="Avance de la partida"
        aria-valuemin="0"
        aria-valuemax={total}
        aria-valuenow={memory ? right : answers.length}
      >
        <span
          style={{
            width: `${((memory ? right : answers.length) / total) * 100}%`,
          }}
        />
      </div>
      {memory ? (
        <>
          <h1>Encuentra las parejas</h1>
          <p>Destapa dos tarjetas. Recuerda dónde está cada figura.</p>
          <div className="memory-stats">
            {right} de {total} pares · {answers.length} intentos
          </div>
          <div className="memory-grid">
            {game.cards.map((shape, i) => {
              const visible = flipped.includes(i) || matched.includes(i);
              return (
                <button
                  key={i}
                  className={`memory-card ${visible ? "revealed" : ""} ${matched.includes(i) ? "matched" : ""}`}
                  disabled={
                    matched.includes(i) ||
                    flipped.includes(i) ||
                    flipped.length === 2
                  }
                  onClick={() => flip(i)}
                  aria-label={
                    visible
                      ? `Tarjeta ${i + 1}: ${shape}`
                      : `Destapar tarjeta ${i + 1}`
                  }
                >
                  {visible ? <Shape name={shape} /> : <span>?</span>}
                </button>
              );
            })}
          </div>
          <div className="feedback" aria-live="polite">
            {flipped.length === 2 ? (
              <>
                Estas figuras son diferentes. Recuerda su posición.
                <button className="primary" onClick={closeCards}>
                  Seguir buscando
                </button>
              </>
            ) : right > 0 ? (
              "¡Sigue así! Encuentra todas las parejas."
            ) : (
              "Elige una tarjeta para empezar."
            )}
          </div>
        </>
      ) : (
        <>
          <p className="round">
            Pregunta {answers.length + 1} de {total}
          </p>
          <h1>{q.prompt}</h1>
          <Visual visual={q.visual} />
          <div className="options">
            {q.options.map((option, i) => (
              <button
                key={i}
                className={`option ${selected !== null && i === q.correct ? "correct" : ""} ${selected === i && i !== q.correct ? "incorrect" : ""}`}
                disabled={selected !== null}
                onClick={() => setSelected(i)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
                {selected !== null && i === q.correct ? (
                  <span className="check">✓</span>
                ) : null}
              </button>
            ))}
          </div>
          {selected !== null && (
            <div
              className={`feedback ${selected === q.correct ? "success" : "review"}`}
              role="status"
            >
              <strong>
                {selected === q.correct ? "¡Correcto!" : "Sigamos aprendiendo."}
              </strong>
              <p>{q.explanation}</p>
              <button className="primary" onClick={next}>
                {answers.length + 1 === total
                  ? "Ver mi resultado"
                  : "Siguiente pregunta"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
