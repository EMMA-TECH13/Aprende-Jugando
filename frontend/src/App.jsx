import React, { useEffect, useState } from "react";
import { api } from "./api";
import Game from "./components/Game";
import PreschoolGame from "./components/PreschoolGame";
import useVoice from "./useVoice";
import Teacher from "./components/Teacher";
const signs = {
  espacio: "↕",
  figuras: "△",
  memoria: "▦",
  tablas: "×",
  fracciones: "½",
  decimales: "1.2",
};
// Coordina el registro, el catálogo y la actividad seleccionada.
export default function App() {
  const { speak } = useVoice();
  const [view, setView] = useState("games"),
    [student, setStudent] = useState(null),
    [name, setName] = useState(""),
    [age, setAge] = useState(""),
    [activities, setActivities] = useState([]),
    [level, setLevel] = useState("Preprimaria"),
    [game, setGame] = useState(null),
    [activity, setActivity] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setActivities(await api("/actividades"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function register(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s = await api("/estudiantes", {
        method: "POST",
        body: { nombre: name, edad: Number(age) },
      });
      setStudent(s);
      setName("");
      setAge("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function start(a) {
    setBusy(true);
    setError("");
    try {
      const g = await api("/partidas", {
        method: "POST",
        body: { estudiante_id: student.id, actividad_id: a.id },
      });
      setActivity(a);
      setGame(g);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const ActivityGame = activity?.nivel === "Preprimaria" ? PreschoolGame : Game;
  return (
    <>
      <header>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            if (!game) setView("games");
          }}
        >
          <span className="brand-mark">A</span>
          <span>
            Aprende<span className="brand-light">Jugando</span>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <button
            disabled={!!game}
            className={view === "games" ? "active" : ""}
            onClick={() => {
              setView("games");
              setError("");
            }}
          >
            Juegos
          </button>
          <button
            disabled={!!game}
            className={view === "teacher" ? "active" : ""}
            onClick={() => {
              setView("teacher");
              setError("");
            }}
          >
            Panel docente
          </button>
        </nav>
      </header>
      <main>
        {view === "teacher" ? (
          <Teacher
            onSelect={(s) => {
              setStudent(s);
              setView("games");
            }}
          />
        ) : game ? (
          <ActivityGame
            key={game.id}
            game={game}
            activity={activity}
            student={student}
            onExit={() => setGame(null)}
          />
        ) : (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  PEQUEÑOS RETOS, GRANDES DESCUBRIMIENTOS
                </p>
                <h1>¿Qué vamos a aprender hoy?</h1>
                <p>Elige un juego. Prueba, descubre y vuelve a intentarlo.</p>
              </div>
              <span className="collection-label">
                6 juegos
                <br />
                <strong>Muchas formas de aprender</strong>
              </span>
            </div>
            <div className="workspace">
              <aside className="student-panel panel">
                {student ? (
                  <>
                    <div className="avatar">
                      {student.nombre[0].toUpperCase()}
                    </div>
                    <p className="eyebrow">HOY JUEGA</p>
                    <h2>{student.nombre}</h2>
                    <p>
                      {student.edad} años · Estudiante #{student.id}
                    </p>
                    <div className="tip">
                      Cada partida es una oportunidad para aprender algo nuevo.
                    </div>
                    <button className="full" onClick={() => setStudent(null)}>
                      Cambiar estudiante
                    </button>
                  </>
                ) : (
                  <>
                    <div className="step-label">01 · ANTES DE EMPEZAR</div>
                    <h2>Registro con ayuda de un adulto</h2>
                    <p>Docente o familiar: completa los datos antes de entregar el dispositivo al niño.</p>
                    <form onSubmit={register}>
                      <label>
                        Nombre
                        <input
                          placeholder="Escribe tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          minLength={2}
                          maxLength={100}
                          required
                          autoComplete="off"
                        />
                      </label>
                      <label>
                        Edad
                        <input
                          type="number"
                          min="3"
                          max="17"
                          step="1"
                          placeholder="Tu edad"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                        />
                      </label>
                      <button
                        className="primary full"
                        disabled={busy || loading}
                      >
                        {busy ? "Guardando…" : "Listo para aprender"}
                      </button>
                    </form>
                    <p className="footnote">
                      ¿Ya está registrado? Selecciónalo desde el panel docente.
                    </p>
                  </>
                )}
              </aside>
              <section className="catalog">
                <div className="catalog-top">
                  <div
                    className="level-tabs"
                    role="group"
                    aria-label="Nivel educativo"
                  >
                    {["Preprimaria", "Primaria"].map((l) => (
                      <button
                        key={l}
                        className={level === l ? "selected" : ""}
                        onClick={() => setLevel(l)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <span className="muted">
                    {level === "Preprimaria"
                      ? "Observa y descubre"
                      : "Piensa y resuelve"}
                  </span>
                </div>
                {error && (
                  <div className="error" role="alert">
                    {error}
                    <button onClick={load}>Reintentar conexión</button>
                  </div>
                )}
                {loading ? (
                  <div className="panel empty" role="status">
                    Cargando actividades…
                  </div>
                ) : (
                  <div className="activity-grid">
                    {activities
                      .filter((a) => a.nivel === level)
                      .map((a, i) => (
                        <article
                          key={a.id}
                          className={`activity-card color-${i}`}
                        >
                          <div className="card-top">
                            <span className="game-icon" aria-hidden="true">
                              {a.nivel === "Preprimaria" ? ({ espacio: "🐱", figuras: "△", memoria: "🐶" }[a.codigo]) : signs[a.codigo]}
                            </span>
                            <span className="activity-tag">
                              {a.codigo === "memoria"
                                ? "6 pares"
                                : a.nivel === "Primaria"
                                  ? "10 preguntas"
                                  : "8 preguntas"}
                            </span>
                          </div>
                          <h2>{a.nombre}</h2>
                          <p>{a.nivel === "Preprimaria" ? ({ espacio: "Escucha y toca la escena correcta.", figuras: "Escucha y busca la figura.", memoria: "Encuentra los animales iguales." }[a.codigo]) : a.descripcion}</p>
                          {a.nivel === "Preprimaria" && <button aria-label={`Escuchar ${a.nombre}`} onClick={() => speak(a.nombre + ". Toca el botón de jugar para empezar.")}>🔊 Escuchar</button>}
                          <button
                            onClick={() => start(a)}
                            disabled={!student || busy}
                          >
                            {busy ? "Preparando…" : "▶ Jugar"}
                          </button>
                        </article>
                      ))}
                  </div>
                )}
                {!student && (
                  <p className="catalog-note">
                    Primero registra o selecciona un estudiante para comenzar.
                  </p>
                )}
                <div className="learning-note">
                  <span className="note-symbol" aria-hidden="true">
                    ✦
                  </span>
                  <div>
                    <strong>Aquí se aprende jugando</strong>
                    <p>
                      Escucha, juega y aprende. Al terminar, verás tus puntos.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
            <footer className="site-footer">
        <div className="footer-summary">
          <span>Aprende Jugando</span>
          <span>Un pequeño reto. Un nuevo aprendizaje.</span>
        </div>

        {view === "games" && !game && (
          <ul className="team-names" aria-label="Integrantes del grupo">
            <li>Diego Xavier Bartolón Gutierrez</li>
            <li>Rony Rosbelí de León Gómez</li>
            <li>Julio Emmanuel Fuentes Cifuentes</li>
            <li>Robin Daniel Meoño Ochoa</li>
            <li>Hugo Jeferson Ochoa Rosales</li>
          </ul>
        )}
      </footer>
    </>
  );
}
