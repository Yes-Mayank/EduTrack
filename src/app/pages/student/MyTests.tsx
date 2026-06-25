import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult } from "../../lib/storage";
import { fmtDateTime, useCountdown, grade, gradeColor } from "../../lib/utils";

export function MyTests() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => q.className === user?.className && q.status !== "draft");
  const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === user?.id);
  const attempted = new Set(results.map((r) => r.quizId));
  const upcoming = quizzes.filter((q) => !attempted.has(q.id));
  const completed = results;

  return (
    <PageShell title="My Tests">
      <div className="tabs tabs-boxed w-fit mb-4">
        <a className={`tab ${tab === "upcoming" ? "tab-active" : ""}`} onClick={() => setTab("upcoming")}>Upcoming ({upcoming.length})</a>
        <a className={`tab ${tab === "completed" ? "tab-active" : ""}`} onClick={() => setTab("completed")}>Completed ({completed.length})</a>
      </div>

      {tab === "upcoming" && (
        upcoming.length === 0 ? <EmptyState icon="🎓" title="No upcoming tests" subtitle="Ask your teacher when the next quiz is!" /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{upcoming.map((q) => <UpcomingCard key={q.id} q={q} />)}</div>
        )
      )}

      {tab === "completed" && (
        completed.length === 0 ? <EmptyState icon="📝" title="No tests completed yet" /> : (
          <div className="overflow-x-auto card bg-base-100 shadow">
            <table className="table table-sm">
              <thead><tr><th>Quiz</th><th>Score</th><th>%</th><th>Grade</th><th>Submitted</th><th></th></tr></thead>
              <tbody>
                {completed.map((r) => {
                  const pct = (r.score / r.totalMarks) * 100;
                  const g = grade(pct);
                  return (
                    <tr key={r.id}>
                      <td>{storage.get<Quiz[]>(KEYS.quizzes, []).find((q) => q.id === r.quizId)?.title || "—"}</td>
                      <td>{r.score}/{r.totalMarks}</td>
                      <td>{pct.toFixed(1)}%</td>
                      <td><span className={`badge badge-sm ${gradeColor(g)}`}>{g}</span></td>
                      <td className="text-xs">{fmtDateTime(r.submittedAt)}</td>
                      <td><Link to="/student/results" className="btn btn-xs btn-outline">View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </PageShell>
  );
}

function UpcomingCard({ q }: { q: Quiz }) {
  const cd = useCountdown(q.scheduledAt);
  const canStart = cd.totalMs < 10 * 60 * 1000 && new Date(q.scheduledAt).getTime() + q.duration * 60000 > Date.now();
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-base">{q.title}</h3>
        <p className="text-xs opacity-70">{q.subject} · {q.duration} min · {q.questions.length} questions</p>
        <p className="text-xs">📅 {fmtDateTime(q.scheduledAt)}</p>
        {canStart ? (
          <Link to={`/student/take/${q.id}`} className="btn btn-warning btn-sm mt-2">Start Quiz</Link>
        ) : (
          <div className="text-xs mt-2 opacity-80">
            Starts in {cd.d}d {cd.h}h {cd.m}m {cd.s}s
            <button className="btn btn-sm btn-disabled w-full mt-1">Not yet</button>
          </div>
        )}
      </div>
    </div>
  );
}
