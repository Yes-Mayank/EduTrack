import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult } from "../../lib/storage";
import { grade } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function Performance() {
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const results = storage.get<QuizResult[]>(KEYS.results, []).filter((r) => r.studentId === user?.id);
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []);
    const trend = results.slice(-10).map((r, i) => ({ name: `T${i + 1}`, score: +((r.score / r.totalMarks) * 100).toFixed(1) }));
    const bySub: Record<string, number[]> = {};
    results.forEach((r) => {
      const q = quizzes.find((q) => q.id === r.quizId);
      const sub = q?.subject || "Other";
      (bySub[sub] ||= []).push((r.score / r.totalMarks) * 100);
    });
    const subjects = Object.entries(bySub).map(([name, arr]) => ({ name, avg: +(arr.reduce((s, n) => s + n, 0) / arr.length).toFixed(1) }));
    const grades: Record<string, number> = {};
    results.forEach((r) => { const g = grade((r.score / r.totalMarks) * 100); grades[g] = (grades[g] || 0) + 1; });
    const pie = Object.entries(grades).map(([name, value]) => ({ name, value }));
    const best = subjects.sort((a, b) => b.avg - a.avg)[0];
    const worst = subjects.length > 1 ? subjects[subjects.length - 1] : null;
    return { trend, subjects, pie, best, worst, count: results.length };
  }, [user]);

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current.querySelectorAll(".perf-card"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
  }, []);

  if (data.count === 0) return <PageShell title="Performance"><EmptyState icon="📈" title="No data yet" subtitle="Complete some quizzes to see your performance" /></PageShell>;

  const COLORS = ["#22c55e", "#2C3639", "#3b82f6", "#A27B5C", "#f97316", "#ef4444"];

  return (
    <PageShell title="Performance">
      <div ref={ref} className="grid lg:grid-cols-2 gap-6">
        <div className="perf-card card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Score trend (last 10)</h3>
          <div className="h-56"><ResponsiveContainer><LineChart data={data.trend}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="score" stroke="#A27B5C" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </div></div>
        <div className="perf-card card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">By subject</h3>
          <div className="h-56"><ResponsiveContainer><BarChart data={data.subjects}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="avg" fill="#A27B5C" /></BarChart></ResponsiveContainer></div>
        </div></div>
        <div className="perf-card card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Grade distribution</h3>
          <div className="h-56"><ResponsiveContainer><PieChart><Pie data={data.pie} dataKey="value" nameKey="name" outerRadius={70} label>{data.pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend /></PieChart></ResponsiveContainer></div>
        </div></div>
        <div className="perf-card card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Strengths & Weaknesses</h3>
          {data.best && <p className="text-sm">✅ You perform best in <strong>{data.best.name}</strong> (avg {data.best.avg}%)</p>}
          {data.worst && <p className="text-sm mt-2">📚 You need improvement in <strong>{data.worst.name}</strong> (avg {data.worst.avg}%)</p>}
          <div className="alert alert-info mt-4 text-xs"><span>You ranked #3 in class last month based on average scores.</span></div>
        </div></div>
      </div>
    </PageShell>
  );
}
