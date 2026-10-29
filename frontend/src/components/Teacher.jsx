import React, { useEffect, useState } from "react";
import { api } from "../api";
// Consulta protegida del historial y filtro por estudiante.
export default function Teacher({ onSelect }) {
  const [draft, setDraft] = useState(""),
    [key, setKey] = useState(""),
    [students, setStudents] = useState([]),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [refresh, setRefresh] = useState(0);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s = await api("/estudiantes", { key: draft });
      setStudents(s);
      setKey(draft);
      setDraft("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    setBusy(true);
    setError("");
    setData(null);
    api(
      `/resultados?pagina=${page}${filter ? `&estudiante_id=${filter}` : ""}`,
      { key, signal: controller.signal },
    )
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [key, filter, page, refresh]);
  if (!key)
    return (
      <section className="panel login">
        <p className="eyebrow">ESPACIO DOCENTE</p>
        <h1>El progreso, en un solo lugar</h1>
        <p>
          Ingresa la clave docente para consultar el historial de tus
          estudiantes.
        </p>
        <form onSubmit={login}>
          <label>
            Clave docente
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            {busy ? "Entrando…" : "Consultar progreso"}
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">ESPACIO DOCENTE</p>
          <h1>Cada intento cuenta</h1>
          <p>Consulta las partidas y acompaña su aprendizaje.</p>
        </div>
        <button
          onClick={() => {
            setKey("");
            setData(null);
            setStudents([]);
          }}
        >
          Cerrar acceso
        </button>
      </div>
      <div className="toolbar panel">
        <label>
          Estudiante
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estudiantes</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} · {s.edad} años · #{s.id}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setRefresh((x) => x + 1)} disabled={busy}>
          Actualizar
        </button>
        {filter && (
          <button
            className="primary"
            onClick={() =>
              onSelect(students.find((s) => String(s.id) === filter))
            }
          >
            Jugar con este estudiante
          </button>
        )}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
          <button onClick={() => setRefresh((x) => x + 1)}>Reintentar</button>
        </div>
      )}
      {busy ? (
        <p role="status">Consultando resultados…</p>
      ) : (
        data && (
          <>
            <div className="stats">
              <article>
                <span>Partidas completadas</span>
                <b>{data.resumen.partidas}</b>
              </article>
              <article>
                <span>Puntaje promedio</span>
                <b>
                  {data.resumen.promedio}
                  <small>/100</small>
                </b>
              </article>
              <article>
                <span>Aciertos acumulados</span>
                <b>{data.resumen.aciertos}</b>
              </article>
            </div>
            <div className="panel history">
              <h2>Historial de aprendizaje</h2>
              {data.resultados.length ? (
                <>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Actividad</th>
                          <th>Puntaje</th>
                          <th>Aciertos / total</th>
                          <th>Intentos</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.resultados.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.estudiante}</strong>
                              <small>#{r.estudiante_id}</small>
                            </td>
                            <td>
                              {r.actividad}
                              <small>{r.nivel}</small>
                            </td>
                            <td>
                              <span className="score-badge">
                                {r.puntaje} / 100
                              </span>
                            </td>
                            <td>
                              {r.aciertos} / {r.total}
                            </td>
                            <td>{r.intentos}</td>
                            <td>
                              {new Date(r.fecha).toLocaleString("es-GT", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </button>
                    <span>
                      Página {data.pagina} de {data.paginas}
                    </span>
                    <button
                      disabled={page >= data.paginas}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty">
                  <h3>Aún no hay partidas completadas</h3>
                  <p>Al terminar un juego, su resultado aparecerá aquí.</p>
                </div>
              )}
            </div>
            <p className="footnote">
              Preguntas: porcentaje de respuestas correctas. En preprimaria se califica la primera elección de cada reto, aunque se permite corregir. Memoria: pares
              encontrados ÷ intentos × 100. El promedio combina estos puntajes.
            </p>
          </>
        )
      )}
    </section>
  );
}
