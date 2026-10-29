import React from "react";
export function Shape({ name, color = "#3156d8" }) {
  return (
    <svg viewBox="0 0 200 160" aria-label={name} role="img">
      {name === "Círculo" ? (
        <circle cx="100" cy="80" r="55" fill={color} />
      ) : name === "Cuadrado" ? (
        <rect x="45" y="25" width="110" height="110" rx="3" fill={color} />
      ) : name === "Triángulo" ? (
        <polygon points="100,18 170,140 30,140" fill={color} />
      ) : name === "Rectángulo" ? (
        <rect x="20" y="40" width="160" height="80" rx="3" fill={color} />
      ) : name === "Rombo" ? (
        <polygon points="100,12 160,80 100,148 40,80" fill={color} />
      ) : (
        <polygon
          points="100,10 120,56 172,60 132,94 145,146 100,118 55,146 68,94 28,60 80,56"
          fill={color}
        />
      )}
    </svg>
  );
}
export default function Visual({ visual }) {
  if (!visual) return null;
  if (visual.kind === "shape")
    return (
      <div className="question-visual">
        <Shape name={visual.shape} />
      </div>
    );
  if (visual.kind === "fraction")
    return (
      <div
        className="fraction-equation"
        aria-label={`${visual.a} sobre ${visual.b} más ${visual.c} sobre ${visual.d}`}
      >
        <span>
          <b>{visual.a}</b>
          <b>{visual.b}</b>
        </span>
        <strong>+</strong>
        <span>
          <b>{visual.c}</b>
          <b>{visual.d}</b>
        </span>
        <strong>= ?</strong>
      </div>
    );
  const p = visual.position;
  let circle = { cx: 160, cy: 100 };
  let ref;
  if (["Adentro", "Afuera"].includes(p)) {
    ref = <rect x="80" y="35" width="155" height="130" rx="12" />;
    circle = p === "Adentro" ? { cx: 158, cy: 100 } : { cx: 290, cy: 100 };
  } else if (["Arriba", "Abajo"].includes(p)) {
    ref = <rect x="145" y="85" width="50" height="50" rx="4" />;
    circle = { cx: 170, cy: p === "Arriba" ? 35 : 185 };
  } else if (["Cerca", "Lejos"].includes(p)) {
    ref = <rect x="35" y="80" width="55" height="55" rx="4" />;
    circle = { cx: p === "Cerca" ? 125 : 290, cy: 108 };
  } else {
    ref = <path d="M70 110H270" />;
    circle = { cx: 170, cy: p === "Encima" ? 87 : 150 };
  }
  return (
    <svg
      className="space-visual"
      viewBox="0 0 340 220"
      role="img"
      aria-label={`Círculo azul ${p.toLowerCase()} de la figura de referencia`}
    >
      <g fill="#fff0b8" stroke="#b98000" strokeWidth="6" strokeLinecap="round">
        {ref}
      </g>
      <circle {...circle} r="20" fill="#3156d8" />
    </svg>
  );
}
