import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import useVoice from "../useVoice";
import { Animal, Figure, Scene, animals } from "./PreschoolVisual";

// Actividades para responder con imágenes, con ayuda oral y reintentos.
export default function PreschoolGame({ game, activity, onExit }) {
  const memory = game.type === "memory";
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [first, setFirst] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false), timer = useRef(null), saveLock = useRef(false);
  const { speak, voiceError } = useVoice();
  const total = memory ? game.cards.length / 2 : game.questions.length;
  const q = memory ? null : game.questions[answers.length];
  const completed = memory ? matched.length / 2 : answers.length;
  const correct = memory ? completed : answers.filter((a, i) => a === game.questions[i].correct).length;
  const score = memory ? (answers.length ? Math.round(correct / answers.length * 100) : 0) : Math.round(correct / total * 100);
  const target = q?.options[q.correct];
  const relation = { Adentro: "dentro de la caja", Afuera: "fuera de la caja", Arriba: "arriba de la caja", Abajo: "abajo de la caja", Cerca: "cerca de la caja", Lejos: "lejos de la caja", Encima: "encima de la mesa", Debajo: "debajo de la mesa" };
  const instruction = memory ? "Toca dos tarjetas y encuentra los animales iguales." : activity.codigo === "figuras" ? `Toca el ${target?.toLowerCase()}.` : `Toca el gato que está ${relation[target]}.`;
  useEffect(() => () => clearTimeout(timer.current), []);

  // El servidor sigue calculando el puntaje; se guarda la primera elección.
  async function save(finalAnswers) {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true); setError("");
    try {
      setSaved(await api("/resultados", { method: "POST", body: { partida_id: game.id, respuestas: finalAnswers } }));
    } catch (e) { setError(e.message); }
    finally { saveLock.current = false; setSaving(false); }
  }
  function finish(finalAnswers) {
    setComplete(true);
    speak("¡Terminaste! ¡Buen trabajo! Toca la casita para volver a los juegos.");
    save(finalAnswers);
  }
  function choose(i) {
    if (lock.current || solved || wrong.includes(i)) return;
    lock.current = true;
    if (first === null) setFirst(i);
    if (i === q.correct) {
      setSolved(true); setMessage("¡Muy bien!");
      speak("¡Muy bien! Toca la flecha para continuar.");
    } else {
      setWrong(old => [...old, i]); setMessage("Inténtalo otra vez");
      speak(`Inténtalo otra vez. ${instruction}`);
    }
    queueMicrotask(() => { lock.current = false; });
  }
  function next() {
    if (lock.current || !solved) return;
    lock.current = true;
    const nextAnswers = [...answers, first];
    setAnswers(nextAnswers); setFirst(null); setWrong([]); setSolved(false); setMessage("");
    if (nextAnswers.length === total) finish(nextAnswers);
    else {
      const nextQuestion = game.questions[nextAnswers.length];
      const nextTarget = nextQuestion.options[nextQuestion.correct];
      speak(activity.codigo === "figuras" ? `Toca el ${nextTarget.toLowerCase()}.` : `Toca el gato que está ${relation[nextTarget]}.`);
    }
    queueMicrotask(() => { lock.current = false; });
  }
  function flip(i) {
    if (lock.current || flipped.includes(i) || matched.includes(i)) return;
    const name = animals[game.cards[i]][1];
    if (!flipped.length) { setFlipped([i]); speak(name); return; }
    lock.current = true;
    const pair = [flipped[0], i], nextAnswers = [...answers, pair];
    const equal = game.cards[pair[0]] === game.cards[i];
    setFlipped(pair); setAnswers(nextAnswers);
    setMessage(equal ? "¡Una pareja!" : "Mira y recuerda");
    speak(equal ? `${name}. ¡Una pareja!` : `${name}. Son diferentes. Prueba otra vez.`);
    // Se muestran ambas tarjetas un momento y se cierran sin pedir lectura.
    timer.current = setTimeout(() => {
      setFlipped([]); setMessage(""); lock.current = false;
      if (equal) {
        const found = [...matched, ...pair]; setMatched(found);
        if (found.length === game.cards.length) finish(nextAnswers);
      }
    }, equal ? 1800 : 3000);
  }
  function exit() {
    if (!saved && !window.confirm("¿Salir de esta partida? Si no ha terminado, no se guardará.")) return;
    onExit();
  }
  const sound = <button className="voice-button" aria-label="Repetir la instrucción" onClick={() => speak(complete ? "¡Buen trabajo! Toca la casita para volver a los juegos." : solved ? "¡Muy bien! Toca la flecha para continuar." : instruction)}><span aria-hidden="true">🔊</span> Escuchar</button>;
  if (!started) return <section className="panel preschool start-preschool">
    <h1>{activity.nombre}</h1>
    <div className="start-picture" aria-hidden="true">{memory ? "🐶 🐱" : activity.codigo === "figuras" ? "● ▲ ■" : "🐱"}</div>
    <button className="primary start-button" onClick={() => { setStarted(true); speak(instruction); }}><span aria-hidden="true">▶</span> Toca para empezar</button>
    <p>Para el adulto: activa el volumen. El niño jugará tocando imágenes.</p>
    <button onClick={onExit}>Volver</button>
  </section>;
  return <section className="panel preschool">
    <div className="game-top"><button onClick={exit} disabled={saving} aria-label="Volver a los juegos">⌂ <span>Volver</span></button>{sound}<span className="score">{score} puntos</span></div>
    {voiceError && <p className="error" role="alert">{voiceError}</p>}
    {complete ? <div className="result">
      <div className="celebration" aria-hidden="true">★ ★ ★</div><h1>¡Buen trabajo!</h1>
      <p>Terminaste el juego.</p><div className="big-score">{saved?.puntaje ?? score}<small>/100 puntos</small></div>
      <p role="status">{saving ? "Guardando…" : saved ? "Resultado guardado." : error}</p>
      {error && <button onClick={() => save(answers)} disabled={saving}>Reintentar guardado</button>}
      <button className="primary home-button" disabled={saving} onClick={exit} aria-label="Volver a los juegos">⌂ Volver a los juegos</button>
    </div> : <>
      <div className="star-progress" aria-label={`${completed} de ${total} retos completados`}>{Array.from({ length: total }, (_, i) => <span key={i} className={i < completed ? "earned" : ""} aria-hidden="true">★</span>)}</div>
      <h1>{instruction}</h1>
      {memory ? <div className="preschool-memory">{game.cards.map((card, i) => {
        const visible = flipped.includes(i) || matched.includes(i);
        return <button key={i} aria-label={visible ? animals[card][1] : `Destapar tarjeta ${i + 1}`} disabled={visible || flipped.length === 2} className={`picture-card ${visible ? "revealed" : ""} ${matched.includes(i) ? "found" : ""}`} onClick={() => flip(i)}>{visible ? <Animal name={card} /> : <span aria-hidden="true">★</span>}</button>;
      })}</div> : <div className={`picture-options ${activity.codigo === "espacio" ? "space-options" : ""}`}>{q.options.map((option, i) => <button key={`${answers.length}-${i}`} className={`picture-card ${wrong.includes(i) ? "try-again" : ""} ${solved && i === q.correct ? "found" : ""}`} aria-label={option} disabled={solved || wrong.includes(i)} onClick={() => choose(i)}>{activity.codigo === "figuras" ? <Figure name={option} index={i} /> : <Scene position={option} />}{solved && i === q.correct && <span className="picture-check" aria-hidden="true">✓</span>}</button>)}</div>}
      <div className="preschool-feedback" role="status">{message}</div>
      {solved && <button className="primary next-picture" aria-label="Siguiente reto" onClick={next}>➜</button>}
    </>}
  </section>;
}
