import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type User, type Quiz, type QuizResult, type Notification } from "../../lib/storage";
import { fmtDateTime, grade } from "../../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ParentDashboard() {
  const { user } = useAuth();
  const data = useMemo(() => {
    const child = storage.get<User[]>(KEYS.users, []).find((u) => u.role === "student" && u.rollNo === user?.childRollNo);
    const results = child ? storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === child.id) : [];
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
    const upcoming = quizzes.filter((q) => q.status === "scheduled" && q.className === child?.className).length;
    const monthly = results.filter((r) => new Date(r.submittedAt).getMonth() === new Date().getMonth());
    const avg = results.length ? results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / results.length : 0;
    const best = results.length ? Math.max(...results.map((r) => (r.score / r.totalMarks) * 100)) : 0;
    const notifs = storage.get<Notification[]>(KEYS.notifications, []).filter((n) => n.userId === user?.id);
    return { child, results, upcoming, taken: monthly.length, avg, bestG: grade(best), notifs };
  }, [user]);

  const chart = data.results.slice(-5).map((r, i) => ({ name: `T${i + 1}`, score: (r.score / r.totalMarks) * 100 }));

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="card shadow-xl stsv-grad-card">
          <div className="card-body">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>Hello, {user?.name}</h2>
            {data.child ? <p className="opacity-90 text-sm">Your child: <strong>{data.child.name}</strong> · Class {data.child.className} · Roll {data.child.rollNo}</p>
              : <p className="text-warning">No child linked. Update profile to link a roll number.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Tests Taken (Month)", v: data.taken, c: "var(--stsv-accent)" },
            { l: "Average Score", v: `${data.avg.toFixed(0)}%`, c: "var(--stsv-accent)" },
            { l: "Best Grade", v: data.bestG, c: "#22c55e" },
            { l: "Upcoming Tests", v: data.upcoming, c: "#ef4444" },
          ].map((s) => (
            <div key={s.l} className="card bg-base-100 shadow"><div className="card-body p-4">
              <div className="text-xs opacity-70">{s.l}</div><div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            </div></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow"><div className="card-body">
            <h3 className="font-bold mb-2">Recent performance</h3>
            <div className="h-40">{chart.length ? <ResponsiveContainer><BarChart data={chart}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#A27B5C" /></BarChart></ResponsiveContainer> : <p className="text-sm opacity-60 text-center pt-12">No results yet</p>}</div>
          </div></div>
          <div className="card bg-base-100 shadow"><div className="card-body">
            <h3 className="font-bold mb-2">Alerts & Notifications</h3>
            {data.notifs.length === 0 ? <p className="text-sm opacity-60">All caught up ✨</p> :
              <ul className="space-y-1 text-sm">{data.notifs.slice(0, 5).map((n) => <li key={n.id} className="border-b py-1"><strong>{n.title}</strong> — <span className="opacity-60 text-xs">{fmtDateTime(n.createdAt)}</span></li>)}</ul>}
            <Link to="/parent/notifications" className="btn btn-sm btn-outline mt-3">View all</Link>
          </div></div>
        </div>
      </div>
    </PageShell>
  );
}
