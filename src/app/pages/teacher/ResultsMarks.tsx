import { useMemo, useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { storage, KEYS, type Quiz, type QuizResult, type User } from "../../lib/storage";
import { useAuth } from "../../lib/auth";
import { grade, gradeColor, toast } from "../../lib/utils";

export function ResultsMarks() {
  const { user } = useAuth();
  const quizzes = useMemo(() => storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => q.teacherId === user?.id), [user]);
  const [quizId, setQuizId] = useState(quizzes[0]?.id || "");
  const [sort, setSort] = useState<"name" | "score">("score");

  const results = useMemo(() => {
    const r = storage.get<QuizResult[]>(KEYS.results, []).filter((x) => x.quizId === quizId);
    return [...r].sort((a, b) => sort === "name" ? a.studentName.localeCompare(b.studentName) : b.score - a.score);
  }, [quizId, sort]);

  const exportCsv = () => {
    const header = "Name,Roll,Score,Percentage,Grade,Time,Submitted\n";
    const rows = results.map((r) => {
      const pct = (r.score / r.totalMarks) * 100;
      return `${r.studentName},${r.studentRoll},${r.score}/${r.totalMarks},${pct.toFixed(1)}%,${grade(pct)},${r.timeTaken}min,${r.submittedAt}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `results-${quizId}.csv`; a.click();
  };

  const sendToAll = () => {
    const users = storage.get<User[]>(KEYS.users, []);
    let count = 0;
    results.forEach((r) => {
      const parent = users.find((u) => u.role === "parent" && u.childRollNo === r.studentRoll);
      if (parent) count++;
    });
    toast(`Email queued to ${count} parents (configure EmailJS in Profile to actually send)`);
  };

  return (
    <PageShell title="Results & Marks" subtitle="View, sort, and export quiz performance">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-2 mb-3">
            <select className="select select-bordered select-sm flex-1 min-w-[200px]" value={quizId} onChange={(e) => setQuizId(e.target.value)}>
              <option value="">Select quiz…</option>
              {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
            <select className="select select-bordered select-sm" value={sort} onChange={(e) => setSort(e.target.value as "name" | "score")}>
              <option value="score">Sort: Score</option><option value="name">Sort: Name</option>
            </select>
            <button className="btn btn-sm" onClick={exportCsv} disabled={!results.length}>Export CSV</button>
            <button className="btn btn-sm btn-warning" onClick={sendToAll} disabled={!results.length}>Send Marks to All Parents</button>
          </div>
          {results.length === 0 ? <EmptyState icon="📊" title="No results yet" /> : (
            <div className="overflow-x-auto">
              <table className="table table-sm table-zebra">
                <thead><tr><th>Name</th><th>Roll</th><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Action</th></tr></thead>
                <tbody>
                  {results.map((r) => {
                    const pct = (r.score / r.totalMarks) * 100;
                    const g = grade(pct);
                    return (
                      <tr key={r.id}>
                        <td>{r.studentName}</td><td>{r.studentRoll}</td>
                        <td>{r.score}/{r.totalMarks}</td><td>{pct.toFixed(1)}%</td>
                        <td><span className={`badge badge-sm ${gradeColor(g)}`}>{g}</span></td>
                        <td>{r.timeTaken}m</td>
                        <td><button className="btn btn-xs btn-outline" onClick={() => toast("Report ready - go to Send Report page")}>Send Report</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
