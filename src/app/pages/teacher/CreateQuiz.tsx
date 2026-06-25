import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { PageShell } from "../../components/PageShell";
import { storage, KEYS, type Quiz, type Question } from "../../lib/storage";
import { useAuth } from "../../lib/auth";
import { toast } from "../../lib/utils";

const id = () => Math.random().toString(36).slice(2, 10);

export function CreateQuiz() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    title: "", subject: "Mathematics", className: "10-A",
    duration: 20, totalMarks: 10, scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    instructions: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQ = () => setQuestions((p) => [...p, { id: id(), text: "", options: ["", "", "", ""], correct: 0, marks: 2 }]);
  const updateQ = (i: number, patch: Partial<Question>) => setQuestions((p) => p.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const removeQ = (i: number) => setQuestions((p) => p.filter((_, idx) => idx !== i));
  const moveQ = (i: number, dir: -1 | 1) => {
    setQuestions((p) => {
      const n = [...p]; const t = n[i + dir]; if (!t) return p; n[i + dir] = n[i]; n[i] = t; return n;
    });
  };

  const goto = (s: number) => {
    gsap.fromTo(".step-pane", { opacity: 0, x: s > step ? 40 : -40 }, { opacity: 1, x: 0, duration: 0.3 });
    setStep(s);
  };

  const publish = (status: "draft" | "scheduled") => {
    if (!info.title || questions.length === 0) { toast("Add a title and at least one question", "error"); return; }
    const quiz: Quiz = {
      id: id(), ...info, scheduledAt: new Date(info.scheduledAt).toISOString(),
      questions, status, teacherId: user!.id, createdAt: new Date().toISOString(),
    };
    const all = storage.get<Quiz[]>(KEYS.quizzes, []);
    storage.set(KEYS.quizzes, [...all, quiz]);
    toast(status === "draft" ? "Saved as draft" : "Quiz published!");
    nav("/teacher/tests");
  };

  return (
    <PageShell title="Create Quiz" subtitle="3-step quiz authoring">
      <ul className="steps w-full mb-6">
        <li className={`step ${step >= 0 ? "step-primary" : ""}`}>Quiz Info</li>
        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Questions</li>
        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Review</li>
      </ul>
      <div className="step-pane card bg-base-100 shadow">
        <div className="card-body">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className="label py-1 text-xs">Title</label><input className="input input-bordered w-full" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /></div>
              <div><label className="label py-1 text-xs">Subject</label><input className="input input-bordered w-full" value={info.subject} onChange={(e) => setInfo({ ...info, subject: e.target.value })} /></div>
              <div><label className="label py-1 text-xs">Class</label><input className="input input-bordered w-full" value={info.className} onChange={(e) => setInfo({ ...info, className: e.target.value })} /></div>
              <div><label className="label py-1 text-xs">Duration (min)</label><input type="number" className="input input-bordered w-full" value={info.duration} onChange={(e) => setInfo({ ...info, duration: +e.target.value })} /></div>
              <div><label className="label py-1 text-xs">Total Marks</label><input type="number" className="input input-bordered w-full" value={info.totalMarks} onChange={(e) => setInfo({ ...info, totalMarks: +e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label py-1 text-xs">Scheduled Date & Time</label><input type="datetime-local" className="input input-bordered w-full" value={info.scheduledAt} onChange={(e) => setInfo({ ...info, scheduledAt: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label py-1 text-xs">Instructions</label><textarea className="textarea textarea-bordered w-full" value={info.instructions} onChange={(e) => setInfo({ ...info, instructions: e.target.value })} /></div>
              <div className="sm:col-span-2 flex justify-end"><button className="btn" onClick={() => goto(1)} style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>Next →</button></div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Questions ({questions.length})</h3>
                <button className="btn btn-sm btn-warning" onClick={addQ}>+ Add Question</button>
              </div>
              {questions.map((q, i) => (
                <div key={q.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="font-semibold text-sm">Q{i + 1}</span>
                      <div className="flex gap-1">
                        <button className="btn btn-xs" onClick={() => moveQ(i, -1)} disabled={i === 0}>↑</button>
                        <button className="btn btn-xs" onClick={() => moveQ(i, 1)} disabled={i === questions.length - 1}>↓</button>
                        <button className="btn btn-xs btn-error" onClick={() => removeQ(i)}>✕</button>
                      </div>
                    </div>
                    <textarea className="textarea textarea-bordered mb-2" placeholder="Question text" value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="radio" className="radio radio-sm" checked={q.correct === idx} onChange={() => updateQ(i, { correct: idx as 0 | 1 | 2 | 3 })} />
                          <span className="text-xs font-bold">{"ABCD"[idx]}</span>
                          <input className="input input-bordered input-sm flex-1" value={q.options[idx]} onChange={(e) => { const opts = [...q.options] as Question["options"]; opts[idx] = e.target.value; updateQ(i, { options: opts }); }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2"><label className="text-xs">Marks:</label><input type="number" className="input input-bordered input-xs w-20" value={q.marks} onChange={(e) => updateQ(i, { marks: +e.target.value })} /></div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between"><button className="btn btn-ghost" onClick={() => goto(0)}>← Back</button><button className="btn" style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }} onClick={() => goto(2)}>Review →</button></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="alert">
                <div>
                  <h3 className="font-bold">{info.title}</h3>
                  <p className="text-xs">{info.subject} · Class {info.className} · {info.duration} min · {questions.length} questions</p>
                </div>
              </div>
              {questions.map((q, i) => (
                <div key={q.id} className="card bg-base-200"><div className="card-body p-3">
                  <p className="font-semibold text-sm">Q{i + 1}. {q.text || <em className="opacity-50">(blank)</em>}</p>
                  <ul className="text-xs mt-1">
                    {q.options.map((o, idx) => <li key={idx} className={q.correct === idx ? "text-success font-bold" : ""}>{"ABCD"[idx]}. {o} {q.correct === idx && "✓"}</li>)}
                  </ul>
                </div></div>
              ))}
              <div className="flex flex-wrap gap-2 justify-end">
                <button className="btn btn-ghost" onClick={() => goto(1)}>← Back</button>
                <button className="btn btn-outline" onClick={() => publish("draft")}>Save Draft</button>
                <button className="btn btn-warning" onClick={() => publish("scheduled")}>Publish</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
