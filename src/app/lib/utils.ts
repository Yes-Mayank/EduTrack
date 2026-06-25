import { useEffect, useState } from "react";

export function grade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export function gradeColor(g: string) {
  if (g === "A+" || g === "A") return "badge-success";
  if (g === "B") return "badge-info";
  if (g === "C") return "badge-warning";
  return "badge-error";
}

export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function useCountdown(targetIso: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, totalMs: diff };
}

let toastId = 0;
type ToastFn = (msg: string, type?: "success" | "error" | "info") => void;
let _toastFn: ToastFn = () => {};
export function setToastFn(fn: ToastFn) { _toastFn = fn; }
export function toast(msg: string, type: "success" | "error" | "info" = "success") {
  _toastFn(msg, type);
  return ++toastId;
}
