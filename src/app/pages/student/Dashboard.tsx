import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult, type User, type Notification } from "../../lib/storage";
import { fmtDateTime, fmtDate, useCountdown } from "../../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const QUOTES = [
  "The expert in anything was once a beginner.",
  "Strive for progress, not perfection.",
  "Learning never exhausts the mind. — Da Vinci",
  "The future depends on what you do today. — Gandhi",
  "Education is the most powerful weapon. — Mandela",
];

export function StudentDashboard() {
  const { user } = useAuth();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const data = useMemo(() => {
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
    const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === user?.id);
    const upcoming = quizzes.filter((q) => q.status === "scheduled" && new Date(q.scheduledAt) > new Date());
    const next = upcoming.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
    const avg = results.length ? results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / results.length : 0;
    const allUsers = storage.get<User[]>(KEYS.users, []).filter((u) => u.role === "student" && u.className === user?.className);
    const ranked = allUsers.map((u) => {
      const rs = results.filter(() => false); // placeholder
      const myRs = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === u.id);
      const a = myRs.length ? myRs.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / myRs.length : 0;
      return { id: u.id, avg: a };
    }).sort((a, b) => b.avg - a.avg);
    const rank = ranked.findIndex((r) => r.id === user?.id) + 1;
    return { upcoming: upcoming.length, completed: results.length, avg, rank: rank || 1, next, results };
  }, [user]);

  const cd = useCountdown(data.next?.scheduledAt || new Date().toISOString());
  const chartData = data.results.slice(-5).map((r, i) => ({ name: `T${i + 1}`, score: (r.score / r.totalMarks) * 100 }));
  const notifications = storage.get<Notification[]>(KEYS.notifications, [])
    .filter((n) => n.userId === user?.id && !n.read).slice(0, 5);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="card shadow-xl stsv-grad-card">
          <div className="card-body">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>Welcome back, {user?.name}!</h2>
            <p className="opacity-90 text-sm">Class {user?.className} · Roll {user?.rollNo}</p>
            <p className="italic text-sm mt-2 opacity-95">"{quote}"</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Upcoming Tests", v: data.upcoming, c: "var(--stsv-accent)" },
            { l: "Tests Completed", v: data.completed, c: "#22c55e" },
            { l: "Average Score", v: `${data.avg.toFixed(0)}%`, c: "var(--stsv-accent)" },
            { l: "Rank in Class", v: `#${data.rank}`, c: "#ef4444" },
          ].map((s) => (
            <div key={s.l} className="card bg-base-100 shadow"><div className="card-body p-4">
              <div className="text-xs opacity-70">{s.l}</div>
              <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            </div></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-bold mb-2">Next Test</h3>
              {data.next ? (
                <>
                  <p className="text-sm font-semibold">{data.next.title}</p>
                  <p className="text-xs opacity-70">{data.next.subject} · {fmtDateTime(data.next.scheduledAt)}</p>
                  <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                    {[["Days", cd.d], ["Hours", cd.h], ["Min", cd.m], ["Sec", cd.s]].map(([l, v]) => (
                      <div key={l} className="bg-base-200 rounded p-2"><div className="text-2xl font-bold" style={{ color: "var(--stsv-accent)" }}>{v}</div><div className="text-[10px] opacity-60">{l}</div></div>
                    ))}
                  </div>
                  <Link to="/student/tests" className="btn btn-sm btn-warning mt-3">View All Tests</Link>
                </>
              ) : <p className="text-sm opacity-60">No upcoming tests 🎉</p>}
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-bold mb-2">Recent results</h3>
              <div className="h-40">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#A27B5C" /></BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm opacity-60 text-center py-8">No quiz results yet</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="font-bold mb-2">📢 Announcements</h3>
            {notifications.length === 0 ? (
              <p className="text-sm opacity-60">No new announcements from your teacher.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className="border-l-4 border-warning pl-3 py-1">
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-xs opacity-70">{n.description}</div>
                    <div className="text-[10px] opacity-50">{fmtDate(n.createdAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
