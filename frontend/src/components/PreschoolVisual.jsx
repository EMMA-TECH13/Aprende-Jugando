import React from "react";
import { Shape } from "./Visual";

// Los mismos identificadores del servidor representan seis parejas de animales.
export const animals = {
  Círculo: ["🐶", "perro"], Cuadrado: ["🐱", "gato"],
  Triángulo: ["🐰", "conejo"], Rectángulo: ["🐸", "rana"],
  Estrella: ["🦁", "león"], Rombo: ["🐼", "panda"],
};
export function Animal({ name }) {
  const [picture, label] = animals[name] || ["🐱", "gato"];
  return <span className="animal-picture" role="img" aria-label={label}>{picture}</span>;
}
export function Figure({ name, index = 0 }) {
  return <Shape name={name} color={["#3576bb", "#de8243", "#53a078", "#a26bb4"][index % 4]} />;
}

// Cada escena usa una referencia visible para que la posición sea inequívoca.
export function Scene({ position }) {
  let x = 170, y = 100, reference;
  if (["Adentro", "Afuera"].includes(position)) {
    reference = <rect x="75" y="40" width="150" height="130" rx="5" />;
    x = position === "Adentro" ? 150 : 285;
  } else if (["Arriba", "Abajo"].includes(position)) {
    reference = <rect x="135" y="90" width="70" height="45" rx="4" />;
    y = position === "Arriba" ? 40 : 180;
  } else if (["Cerca", "Lejos"].includes(position)) {
    reference = <rect x="25" y="80" width="60" height="65" rx="4" />;
    x = position === "Cerca" ? 122 : 285;
  } else {
    reference = <><path d="M70 115H270" /><path d="M85 115V200M255 115V200" /></>;
    y = position === "Encima" ? 92 : 165;
  }
  return <svg viewBox="0 0 340 225" role="img" aria-label={`Gato ${position.toLowerCase()}`}>
    <g fill="#f4d99a" stroke="#92713c" strokeWidth="5" strokeLinecap="round">{reference}</g>
    <g transform={`translate(${x},${y})`} fill="#e8a45b" stroke="#81562c" strokeWidth="2">
      <path d="M-22-12L-23-32L-7-22M7-22L23-32L22-12" />
      <ellipse rx="25" ry="23" />
      <g fill="#293442" stroke="none"><circle cx="-9" cy="-4" r="3"/><circle cx="9" cy="-4" r="3"/><path d="M-4 5H4L0 10Z"/></g>
      <path d="M-30 3L-12 7M12 7L30 3M-29 13L-12 12M12 12L29 13" fill="none" />
    </g>
  </svg>;
}
