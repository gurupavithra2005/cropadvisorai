import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LANGS } from "@/lib/i18n";

function speechLang() {
  const code = (typeof window !== "undefined" && localStorage.getItem("lang")) || "en";
  return LANGS.find((l) => l.code === code)?.speech || "en-IN";
}

export function useSpeak() {
  return useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLang();
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, []);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any;

export function useListen(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = speechLang();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SR) => {
      const text = Array.from(e.results as ArrayLike<SR>)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(" ");
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const start = () => {
    if (!recRef.current) return;
    try { recRef.current.start(); setListening(true); } catch { /* already started */ }
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  return { listening, start, stop, supported: !!recRef.current };
}
