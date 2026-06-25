import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { PageShell } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult, type Concern } from "../../lib/storage";
import { fmtDate, toast } from "../../lib/utils";

export function RaiseConcern() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"new" | "mine">("new");
  const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === user?.id);
  const attemptedQuizIds = new Set(results.map((r) => r.quizId));
  const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => attemptedQuizIds.has(q.id));
  const [quizId, setQuizId] = useState("");
  const [qNo, setQNo] = useState("1");
  const [type, setType] = useState("Wrong Answer Key");
  const [desc, setDesc] = useState("");
  const checkRef = useRef<HTMLDivElement>(null);
  const [success, setSuccess] = useState(false);
  const [myConcerns, setMyConcerns] = useState<Concern[]>(storage.get<Concern[]>(KEYS.concerns, []).filter((c) => c.studentId === user?.id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !desc) { toast("Fill all fields", "error"); return; }
    const quiz = quizzes.find((q) => q.id === quizId);
    const c: Concern = {
      id: Math.random().toString(36).slice(2, 10),
      studentId: user!.id, studentName: user!.name,
      quizId, quizName: quiz?.title || "", questionNo: +qNo, type,
      description: desc, status: "open", createdAt: new Date().toISOString(),
    };
    const all = storage.get<Concern[]>(KEYS.concerns, []);
    storage.set(KEYS.concerns, [...all, c]);
    setMyConcerns([...myConcerns, c]);
    setDesc("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  useEffect(() => {
    if (success && checkRef.current) gsap.fromTo(checkRef.current, { scale: 0 }, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 });
  }, [success]);

  return (
    <PageShell title="Concerns">
      <div className="tabs tabs-boxed w-fit mb-4">
        <a className={`tab ${tab === "new" ? "tab-active" : ""}`} onClick={() => setTab("new")}>Raise New</a>
        <a className={`tab ${tab === "mine" ? "tab-active" : ""}`} onClick={() => setTab("mine")}>My Concerns ({myConcerns.length})</a>
      </div>

      {tab === "new" && (
        <div className="card bg-base-100 shadow max-w-2xl">
          <form onSubmit={submit} className="card-body space-y-3">
            <div>
              <label className="label py-1 text-xs">Quiz</label>
              <select className="select select-bordered w-full" value={quizId} onChange={(e) => setQuizId(e.target.value)}>
                <option value="">Select quiz…</option>
                {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label py-1 text-xs">Question No.</label><input type="number" className="input input-bordered w-full" value={qNo} onChange={(e) => setQNo(e.target.value)} /></div>
              <div>
                <label className="label py-1 text-xs">Type</label>
                <select className="select select-bordered w-full" value={type} onChange={(e) => setType(e.target.value)}>
                  <option>Wrong Answer Key</option><option>Unclear Question</option><option>Technical Issue</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label py-1 text-xs">Detailed description</label>
              <textarea className="textarea textarea-bordered w-full" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <label className="label py-1 text-xs">Screenshot (optional)</label>
              <input type="file" className="file-input file-input-bordered w-full" />
            </div>
            <button className="btn btn-warning">Submit Concern</button>
            {success && <div ref={checkRef} className="text-center text-success text-3xl">✅</div>}
          </form>
        </div>
      )}

      {tab === "mine" && (
        <div className="space-y-2">
          {myConcerns.length === 0 ? <p className="text-sm opacity-60">No concerns raised yet.</p> :
            myConcerns.map((c) => (
              <div key={c.id} className="card bg-base-100 shadow"><div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{c.quizName} · Q{c.questionNo}</h4>
                    <p className="text-xs opacity-70">{c.type} · {fmtDate(c.createdAt)}</p>
                    <p className="text-sm mt-1">{c.description}</p>
                    {c.resolution && <p className="text-xs italic mt-1">Teacher: {c.resolution}</p>}
                  </div>
                  <span className={`badge ${c.status === "resolved" ? "badge-success" : "badge-warning"}`}>{c.status}</span>
                </div>
              </div></div>
            ))}
        </div>
      )}
    </PageShell>
  );
}
