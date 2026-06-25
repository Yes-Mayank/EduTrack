import { useMemo, useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult, type User } from "../../lib/storage";
import { grade, gradeColor, fmtDate, toast } from "../../lib/utils";

export function ChildResults() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState<QuizResult | null>(null);

  const data = useMemo(() => {
    const child = storage.get<User[]>(KEYS.users, []).find((u) => u.role === "student" && u.rollNo === user?.childRollNo);
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
    const teachers = storage.get<User[]>(KEYS.users, []).filter((u) => u.role === "teacher");
    const results = child ? storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === child.id) : [];
    const subjects = [...new Set(results.map((r) => quizzes.find((q) => q.id === r.quizId)?.subject).filter(Boolean))] as string[];
    return { child, quizzes, teachers, results, subjects };
  }, [user]);

  const filtered = data.results.filter((r) => {
    if (!subject) return true;
    const q = data.quizzes.find((q) => q.id === r.quizId);
    return q?.subject === subject;
  });

  const downloadReport = () => {
    const html = `<!DOCTYPE html><html><head><title>Report Card - ${data.child?.name}</title>
      <style>body{font-family:Arial;padding:30px;color:#2C3639}h1{color:#2C3639}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#2C3639;color:#A27B5C}.logo{display:inline-block;width:60px;height:60px;border-radius:50%;background:#2C3639;color:#A27B5C;text-align:center;line-height:60px;font-weight:bold;font-size:18px}</style></head>
      <body><div style="text-align:center"><div class="logo">STSV</div><h1>STSV International Sr. Secondary School</h1><p>Dhanupra, Arrah, Bihar (802301)</p></div>
      <h2>Report Card</h2><p><strong>Name:</strong> ${data.child?.name} · <strong>Roll:</strong> ${data.child?.rollNo} · <strong>Class:</strong> ${data.child?.className}</p>
      <table><thead><tr><th>Subject</th><th>Quiz</th><th>Score</th><th>Grade</th><th>Date</th></tr></thead><tbody>
      ${filtered.map((r) => { const q = data.quizzes.find((q) => q.id === r.quizId); const pct = (r.score / r.totalMarks) * 100; return `<tr><td>${q?.subject || ""}</td><td>${q?.title || ""}</td><td>${r.score}/${r.totalMarks}</td><td>${grade(pct)}</td><td>${fmtDate(r.submittedAt)}</td></tr>`; }).join("")}
      </tbody></table><p style="margin-top:30px">Teacher's remark: <em>Consistent performer, keep it up!</em></p><p>Generated: ${fmtDate(new Date().toISOString())}</p></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    toast("Report card opened in new tab");
  };

  if (!data.child) return <PageShell title="Child's Results"><EmptyState icon="👶" title="No child linked" /></PageShell>;

  return (
    <PageShell title="Child's Results" subtitle={data.child.name}>
      <div className="card bg-base-100 shadow"><div className="card-body">
        <div className="flex flex-wrap gap-2 mb-3">
          <select className="select select-bordered select-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>{data.subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-sm btn-warning ml-auto" onClick={downloadReport}>Download Report Card</button>
        </div>
        {filtered.length === 0 ? <EmptyState icon="📊" title="No results" /> : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>Quiz</th><th>Subject</th><th>Date</th><th>Score</th><th>%</th><th>Grade</th></tr></thead>
              <tbody>
                {filtered.map((r) => {
                  const q = data.quizzes.find((q) => q.id === r.quizId);
                  const pct = (r.score / r.totalMarks) * 100;
                  const g = grade(pct);
                  return (
                    <tr key={r.id} className="hover cursor-pointer" onClick={() => setDetail(r)}>
                      <td>{q?.title}</td><td>{q?.subject}</td>
                      <td className="text-xs">{fmtDate(r.submittedAt)}</td>
                      <td>{r.score}/{r.totalMarks}</td><td>{pct.toFixed(1)}%</td>
                      <td><span className={`badge badge-sm ${gradeColor(g)}`}>{g}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div></div>

      {detail && (() => {
        const q = data.quizzes.find((q) => q.id === detail.quizId)!;
        return (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold">{q.title} · {q.subject}</h3>
              {q.questions.map((qq, i) => (
                <div key={qq.id} className="border rounded p-2 my-2 text-sm">
                  <p className="font-semibold">Q{i + 1}. {qq.text}</p>
                  {qq.options.map((o, idx) => (
                    <div key={idx} className={idx === qq.correct ? "text-success" : detail.answers[qq.id] === idx ? "text-error" : ""}>
                      {"ABCD"[idx]}. {o}
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
