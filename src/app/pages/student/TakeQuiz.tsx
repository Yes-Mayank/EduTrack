import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult } from "../../lib/storage";
import { toast, grade } from "../../lib/utils";

export function TakeQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const quiz = storage.get<Quiz[]>(KEYS.quizzes, []).find((q) => q.id === quizId);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [time, setTime] = useState((quiz?.duration || 10) * 60);
  const [submitted, setSubmitted] = useState<QuizResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!quiz) return;
    const existing = storage.get<QuizResult[]>(KEYS.results, []).find((r) => r.quizId === quiz.id && r.studentId === user?.id);
    if (existing) { setSubmitted(existing); return; }
    const t = setInterval(() => setTime((s) => {
      if (s <= 1) { clearInterval(t); submit(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paneRef.current) gsap.fromTo(paneRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.3 });
  }, [idx]);

  if (!quiz) return <div className="p-8">Quiz not found.</div>;
  if (submitted) return <Review quiz={quiz} result={submitted} onClose={() => nav("/student/results")} />;

  const q = quiz.questions[idx];
  const toggleFlag = () => { const s = new Set(flagged); s.has(q.id) ? s.delete(q.id) : s.add(q.id); setFlagged(s); };

  const submit = (auto = false) => {
    let score = 0;
    quiz.questions.forEach((qq) => { if (answers[qq.id] === qq.correct) score += qq.marks; });
    const result: QuizResult = {
      id: Math.random().toString(36).slice(2, 10), quizId: quiz.id, studentId: user!.id,
      studentRoll: user!.rollNo!, studentName: user!.name, answers, score,
      totalMarks: quiz.totalMarks, timeTaken: Math.round((Date.now() - startedAt.current) / 60000),
      submittedAt: new Date().toISOString(),
    };
    const all = storage.get<QuizResult[]>(KEYS.results, []);
    storage.set(KEYS.results, [...all, result]);
    setSubmitted(result);
    toast(auto ? "Time up - auto-submitted" : "Submitted!");
  };

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar shadow-md sticky top-0 z-30" style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>
        <div className="flex-1 px-4">
          <div className="font-bold">{quiz.title}</div>
          <div className="text-xs opacity-80 ml-3">{quiz.subject}</div>
        </div>
        <div className="px-4 font-mono text-xl tabular-nums">{mm}:{ss}</div>
      </header>
      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-[200px_1fr] gap-4">
        <aside className="card bg-base-100 shadow h-fit p-3">
          <h4 className="font-bold text-xs mb-2">Questions</h4>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-1">
            {quiz.questions.map((qq, i) => {
              const a = answers[qq.id] !== undefined;
              const f = flagged.has(qq.id);
              return <button key={qq.id} onClick={() => setIdx(i)}
                className={`btn btn-xs ${i === idx ? "btn-primary" : a ? "btn-success" : f ? "btn-warning" : "btn-outline"}`}>{i + 1}</button>;
            })}
          </div>
          <div className="text-[10px] opacity-60 mt-3 space-y-1">
            <div>🟢 Answered</div><div>🟡 Flagged</div><div>⚪ Unanswered</div>
          </div>
        </aside>
        <main ref={paneRef} className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-70">Question {idx + 1} of {quiz.questions.length} · {q.marks} marks</span>
              <button className={`btn btn-xs ${flagged.has(q.id) ? "btn-warning" : "btn-outline"}`} onClick={toggleFlag}>🚩 Flag</button>
            </div>
            <h2 className="text-lg font-semibold mb-4">{q.text}</h2>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded border cursor-pointer ${answers[q.id] === i ? "border-primary bg-primary/10" : "border-base-300"}`}>
                  <input type="radio" className="radio" checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
                  <span className="font-bold">{"ABCD"[i]}.</span><span>{opt}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</button>
              {idx < quiz.questions.length - 1
                ? <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>Next →</button>
                : <button className="btn btn-warning" onClick={() => setConfirming(true)}>Submit</button>}
            </div>
          </div>
        </main>
      </div>
      {confirming && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold">Submit quiz?</h3>
            <p className="text-sm mt-2">You answered {Object.keys(answers).length} of {quiz.questions.length} questions.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn-warning" onClick={() => { setConfirming(false); submit(); }}>Submit</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

function Review({ quiz, result, onClose }: { quiz: Quiz; result: QuizResult; onClose: () => void }) {
  const pct = (result.score / result.totalMarks) * 100;
  const g = grade(pct);
  const ref = useRef<HTMLDivElement>(null);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const obj = { v: 0 };
    gsap.to(obj, { v: result.score, duration: 1.2, ease: "power2.out", onUpdate: () => setAnimScore(Math.round(obj.v)) });
    if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 });
  }, [result.score]);

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div ref={ref} className="max-w-3xl mx-auto card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>{quiz.title}</h2>
          <p className="text-sm opacity-70">{quiz.subject}</p>
          <div className="grid grid-cols-3 gap-4 my-4 text-center">
            <div><div className="text-4xl font-bold" style={{ color: "var(--stsv-ink)" }}>{animScore}/{result.totalMarks}</div><div className="text-xs opacity-60">Score</div></div>
            <div><div className="text-4xl font-bold" style={{ color: "var(--stsv-accent)" }}>{pct.toFixed(1)}%</div><div className="text-xs opacity-60">Percentage</div></div>
            <div><div className="text-4xl font-bold text-success">{g}</div><div className="text-xs opacity-60">Grade</div></div>
          </div>
          <h3 className="font-bold mt-3">Question review</h3>
          {quiz.questions.map((q, i) => {
            const ans = result.answers[q.id];
            const correct = q.correct;
            return (
              <div key={q.id} className="border rounded p-3">
                <p className="font-semibold text-sm">Q{i + 1}. {q.text}</p>
                {q.options.map((opt, idx) => (
                  <div key={idx} className={`text-sm pl-3 ${idx === correct ? "text-success font-bold" : ans === idx && ans !== correct ? "text-error line-through" : ""}`}>
                    {"ABCD"[idx]}. {opt} {idx === correct ? "✓" : ans === idx ? "✗" : ""}
                  </div>
                ))}
              </div>
            );
          })}
          <button className="btn mt-4" onClick={onClose}>Back to Results</button>
        </div>
      </div>
    </div>
  );
}
