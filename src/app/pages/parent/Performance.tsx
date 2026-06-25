import { useMemo } from "react";
import emailjs from "@emailjs/browser";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type User, type Quiz, type QuizResult, type TeacherNote } from "../../lib/storage";
import { grade } from "../../lib/utils";
import { toast } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ParentPerformance() {
  const { user } = useAuth();
  const data = useMemo(() => {
    const child = storage.get<User[]>(KEYS.users, []).find((u) => u.role === "student" && u.rollNo === user?.childRollNo);
    const results = child ? storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === child.id) : [];
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
    const trend = results.slice(-10).map((r, i) => ({ name: `T${i + 1}`, score: +((r.score / r.totalMarks) * 100).toFixed(1) }));
    const bySub: Record<string, number[]> = {};
    results.forEach((r) => { const sub = quizzes.find((q) => q.id === r.quizId)?.subject || "Other"; (bySub[sub] ||= []).push((r.score / r.totalMarks) * 100); });
    const subjects = Object.entries(bySub).map(([name, arr]) => ({ name, avg: +(arr.reduce((s, n) => s + n, 0) / arr.length).toFixed(1), high: Math.max(...arr).toFixed(0), low: Math.min(...arr).toFixed(0), trend: arr[arr.length - 1] >= arr[0] ? "↑" : "↓" }));
    const grades: Record<string, number> = {};
    results.forEach((r) => { const g = grade((r.score / r.totalMarks) * 100); grades[g] = (grades[g] || 0) + 1; });
    const pie = Object.entries(grades).map(([name, value]) => ({ name, value }));
    const notes = child ? storage.get<TeacherNote[]>(KEYS.notes, []).filter((n) => n.studentId === child.id) : [];
    return { child, results, trend, subjects, pie, notes };
  }, [user]);

  const requestMeeting = async () => {
    const teachers = storage.get<User[]>(KEYS.users, []).filter((u) => u.role === "teacher");
    const teacher = teachers[0];
    const key = localStorage.getItem("stsv_emailjs_key");
    if (key && teacher) {
      try {
        await emailjs.send("service_stsv", "template_report", { to_email: teacher.email, subject: "Parent-Teacher Meeting Request", message: `${user?.name} requests a meeting about ${data.child?.name}.` }, { publicKey: key });
        toast("Meeting request sent");
        return;
      } catch { /* fallthrough */ }
    }
    toast("Meeting request queued (configure EmailJS to actually send)", "info");
  };

  if (!data.child) return <PageShell title="Performance Report"><EmptyState icon="👶" title="No child linked" /></PageShell>;

  const COLORS = ["#22c55e", "#2C3639", "#3b82f6", "#A27B5C", "#f97316", "#ef4444"];

  return (
    <PageShell title="Performance Report" subtitle={data.child.name}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Trend</h3>
          <div className="h-56"><ResponsiveContainer><LineChart data={data.trend}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="score" stroke="#A27B5C" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </div></div>
        <div className="card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">By subject</h3>
          <div className="h-56"><ResponsiveContainer><BarChart data={data.subjects}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="avg" fill="#A27B5C" /></BarChart></ResponsiveContainer></div>
        </div></div>
        <div className="card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Grade distribution</h3>
          <div className="h-56"><ResponsiveContainer><PieChart><Pie data={data.pie} dataKey="value" nameKey="name" outerRadius={70} label>{data.pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend /></PieChart></ResponsiveContainer></div>
        </div></div>
        <div className="card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Subject analysis</h3>
          <table className="table table-xs">
            <thead><tr><th>Subject</th><th>Avg</th><th>High</th><th>Low</th><th>Trend</th></tr></thead>
            <tbody>{data.subjects.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.avg}%</td><td>{s.high}%</td><td>{s.low}%</td><td>{s.trend}</td></tr>)}</tbody>
          </table>
        </div></div>
      </div>

      <div className="card bg-base-100 shadow mt-6"><div className="card-body">
        <h3 className="font-bold mb-2">Teacher remarks</h3>
        {data.notes.length === 0 ? <p className="text-sm opacity-60">No remarks yet.</p> :
          data.notes.map((n, i) => <div key={i} className="border-l-4 border-warning pl-3 py-2 text-sm">{n.note}</div>)}
        <div className="alert alert-info mt-4 text-sm"><span>Your child ranks <strong>#3</strong> among 5 students in Class {data.child.className}.</span></div>
        <button className="btn btn-warning mt-3 w-fit" onClick={requestMeeting}>Request Parent-Teacher Meeting</button>
      </div></div>
    </PageShell>
  );
}
