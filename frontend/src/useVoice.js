import { useCallback, useEffect, useRef, useState } from "react";

// Lee instrucciones en español sin enviar nombres ni datos del estudiante.
export default function useVoice() {
  const [voiceError, setVoiceError] = useState("");
  const current = useRef(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = useCallback((text) => {
    if (!supported) {
      setVoiceError("Este navegador no ofrece voz. Un adulto debe acompañar la actividad o abrirla en un navegador con voz en español.");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    speech.voice = voices.find(v => /^es-(GT|MX)/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang)) || null;
    speech.lang = speech.voice?.lang || "es-MX";
    speech.rate = 0.85;
    speech.onstart = () => setVoiceError("");
    speech.onerror = (event) => {
      if (!["canceled", "interrupted"].includes(event.error))
        setVoiceError("No se pudo reproducir la voz. Revisa el volumen y pulsa la bocina. Si continúa, pide ayuda a un adulto.");
    };
    current.current = speech;
    synth.speak(speech);
  }, [supported]);
  useEffect(() => {
    if (!supported) return;
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);
  return { speak, voiceError, supported };
}
