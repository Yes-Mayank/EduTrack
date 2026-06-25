import { useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult } from "../../lib/storage";
import { grade, gradeColor, fmtDateTime } from "../../lib/utils";

export function MyResults() {
  const { user } = useAuth();
  const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === user?.id);
  const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
  const [detail, setDetail] = useState<QuizResult | null>(null);

  const scores = results.map((r) => (r.score / r.totalMarks) * 100);
  const best = scores.length ? Math.max(...scores) : 0;
  const worst = scores.length ? Math.min(...scores) : 0;
  const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;

  return (
    <PageShell title="My Results">
      {results.length === 0 ? <EmptyState icon="📭" title="No results yet" subtitle="Take a quiz to see your results here" /> : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="stat bg-base-100 shadow rounded"><div className="stat-title text-xs">Best</div><div className="stat-value text-success text-2xl">{best.toFixed(0)}%</div></div>
            <div className="stat bg-base-100 shadow rounded"><div className="stat-title text-xs">Average</div><div className="stat-value text-2xl" style={{ color: "var(--stsv-ink)" }}>{avg.toFixed(0)}%</div></div>
            <div className="stat bg-base-100 shadow rounded"><div className="stat-title text-xs">Worst</div><div className="stat-value text-error text-2xl">{worst.toFixed(0)}%</div></div>
          </div>
          <div className="overflow-x-auto card bg-base-100 shadow">
            <table className="table table-sm">
              <thead><tr><th>Quiz</th><th>Subject</th><th>Date</th><th>Score</th><th>%</th><th>Grade</th><th>Status</th></tr></thead>
              <tbody>
                {results.map((r) => {
                  const q = quizzes.find((q) => q.id === r.quizId);
                  const pct = (r.score / r.totalMarks) * 100;
                  const g = grade(pct);
                  return (
                    <tr key={r.id} className="hover cursor-pointer" onClick={() => setDetail(r)}>
                      <td>{q?.title || "—"}</td><td>{q?.subject || "—"}</td>
                      <td className="text-xs">{fmtDateTime(r.submittedAt)}</td>
                      <td>{r.score}/{r.totalMarks}</td><td>{pct.toFixed(1)}%</td>
                      <td><span className={`badge badge-sm ${gradeColor(g)}`}>{g}</span></td>
                      <td><span className={`badge badge-sm ${pct >= 40 ? "badge-success" : "badge-error"}`}>{pct >= 40 ? "Pass" : "Fail"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detail && (() => {
        const q = quizzes.find((q) => q.id === detail.quizId)!;
        return (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold">{q?.title}</h3>
              <p className="text-sm opacity-70">{q?.subject}</p>
              <div className="my-3"><span className="text-2xl font-bold">{detail.score}/{detail.totalMarks}</span></div>
              {q?.questions.map((qq, i) => (
                <div key={qq.id} className="border rounded p-2 my-2 text-sm">
                  <p className="font-semibold">Q{i + 1}. {qq.text}</p>
                  {qq.options.map((o, idx) => (
                    <div key={idx} className={idx === qq.correct ? "text-success" : detail.answers[qq.id] === idx ? "text-error" : ""}>
                      {"ABCD"[idx]}. {o} {idx === qq.correct ? "✓" : ""}
                    </div>
                  ))}
                </div>
              ))}
              <div className="modal-action"><button className="btn btn-sm" onClick={() => setDetail(null)}>Close</button></div>
            </div>
          </dialog>
        );
      })()}
    </PageShell>
  );
}
