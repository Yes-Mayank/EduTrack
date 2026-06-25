import { useMemo, useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { storage, KEYS, type User, type QuizResult, type TeacherNote } from "../../lib/storage";
import { useAuth } from "../../lib/auth";
import { initials, toast } from "../../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function MyStudents() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  const students = useMemo(() => storage.get<User[]>(KEYS.users, []).filter((u) => u.role === "student"), []);
  const results = useMemo(() => storage.get<QuizResult[]>(KEYS.results, []), [selected]);
  const classes = [...new Set(students.map((s) => s.className).filter(Boolean))];

  const filtered = students.filter((s) =>
    (!classFilter || s.className === classFilter) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo?.includes(search))
  );

  const studentStats = (id: string) => {
    const rs = results.filter((r) => r.studentId === id);
    if (!rs.length) return { avg: 0, status: "Average" as const };
    const avg = rs.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / rs.length;
    const status: "Good" | "Average" | "Needs Attention" = avg >= 75 ? "Good" : avg >= 50 ? "Average" : "Needs Attention";
    return { avg, status };
  };

  return (
    <PageShell title="My Students" subtitle="Search, view, and message students">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-2 mb-3">
            <input className="input input-bordered input-sm flex-1 min-w-[200px]" placeholder="Search name or roll no…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="select select-bordered select-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All classes</option>
              {classes.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? <EmptyState icon="🧑‍🎓" title="No students found" /> : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Attendance</th><th>Avg Score</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((s, idx) => {
                    const st = studentStats(s.id);
                    const att = 85 + ((idx * 7) % 13);
                    return (
                      <tr key={s.id} className="cursor-pointer hover" onClick={() => setSelected(s)}>
                        <td>{s.rollNo}</td>
                        <td className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="w-8 rounded-full text-white" style={{ background: s.avatarColor }}><span className="text-xs">{initials(s.name)}</span></div>
                          </div>
                          {s.name}
                        </td>
                        <td>{s.className}</td>
                        <td>{att}%</td>
                        <td>{st.avg.toFixed(0)}%</td>
                        <td><span className={`badge badge-sm ${st.status === "Good" ? "badge-success" : st.status === "Average" ? "badge-warning" : "badge-error"}`}>{st.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && <StudentModal student={selected} teacherId={user!.id} onClose={() => setSelected(null)} />}
    </PageShell>
  );
}

function StudentModal({ student, teacherId, onClose }: { student: User; teacherId: string; onClose: () => void }) {
  const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === student.id);
  const notesArr = storage.get<TeacherNote[]>(KEYS.notes, []);
  const existing = notesArr.find((n) => n.studentId === student.id && n.teacherId === teacherId);
  const [note, setNote] = useState(existing?.note || "");

  const saveNote = () => {
    const filtered = notesArr.filter((n) => !(n.studentId === student.id && n.teacherId === teacherId));
    storage.set(KEYS.notes, [...filtered, { studentId: student.id, teacherId, note, updatedAt: new Date().toISOString() }]);
    toast("Note saved");
  };

  const parent = storage.get<User[]>(KEYS.users, []).find((u) => u.role === "parent" && u.childRollNo === student.rollNo);
  const chartData = results.map((r, i) => ({ name: `Q${i + 1}`, score: (r.score / r.totalMarks) * 100 }));

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar placeholder"><div className="w-14 rounded-full text-white" style={{ background: student.avatarColor }}><span>{initials(student.name)}</span></div></div>
          <div>
            <h3 className="font-bold text-lg">{student.name}</h3>
            <p className="text-xs opacity-70">Roll {student.rollNo} · Class {student.className} · {student.email}</p>
          </div>
        </div>
        <div className="h-48 mb-3">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#A27B5C" /></BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" title="No quiz scores yet" />}
        </div>
        <div className="mb-3">
          <div className="text-xs opacity-70 mb-1">Attendance: 92%</div>
          <progress className="progress progress-success w-full" value={92} max={100} />
        </div>
        <div className="mb-3">
          <label className="label py-1"><span className="label-text text-xs font-semibold">Teacher's note</span></label>
          <textarea className="textarea textarea-bordered w-full" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-sm mt-2" onClick={saveNote} style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>Save Note</button>
        </div>
        <div className="modal-action">
          {parent && <a className="btn btn-warning btn-sm" href={`mailto:${parent.email}?subject=About ${student.name}`}>Email Parent ({parent.email})</a>}
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
}
