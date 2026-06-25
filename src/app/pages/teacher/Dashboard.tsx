import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { PageShell } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Quiz, type QuizResult, type Concern, type User } from "../../lib/storage";
import { fmtDateTime } from "../../lib/utils";

export function TeacherDashboard() {
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const quizzes = storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => q.teacherId === user?.id);
    const users = storage.get<User[]>(KEYS.users, []);
    const students = users.filter((u) => u.role === "student");
    const results = storage.get<QuizResult[]>(KEYS.results, []);
    const concerns = storage.get<Concern[]>(KEYS.concerns, []).filter((c) => c.status !== "resolved");
    const scheduled = quizzes.filter((q) => q.status === "scheduled").length;
    const completed = quizzes.filter((q) => q.status === "completed").length;
    return { students: students.length, scheduled, completed, concerns: concerns.length, quizzes, results };
  }, [user]);

  useEffect(() => {
    gsap.fromTo(".stat-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const recent = [
    ...data.quizzes.slice(-3).map((q) => ({ t: `Created quiz "${q.title}"`, d: q.createdAt })),
    ...data.results.slice(-2).map((r) => ({ t: `${r.studentName} submitted a quiz`, d: r.submittedAt })),
  ].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 5);

  return (
    <PageShell>
      <div ref={ref} className="space-y-6">
        <div className="stat-card card shadow-xl stsv-grad-card">
          <div className="card-body">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>{greet}, {user?.name}</h2>
            <p className="opacity-80">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total Students", v: data.students, c: "var(--stsv-accent)" },
            { l: "Tests Scheduled", v: data.scheduled, c: "var(--stsv-accent)" },
            { l: "Tests Completed", v: data.completed, c: "#22c55e" },
            { l: "Pending Concerns", v: data.concerns, c: "#ef4444" },
          ].map((s) => (
            <div key={s.l} className="stat-card card bg-base-100 shadow">
              <div className="card-body p-4">
                <div className="text-xs opacity-70">{s.l}</div>
                <div className="text-4xl font-bold" style={{ color: s.c, fontFamily: "Poppins" }}>{s.v}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card bg-base-100 shadow stat-card">
            <div className="card-body">
              <h3 className="font-bold mb-2">Recent activity</h3>
              {recent.length === 0 ? <p className="text-sm opacity-60">No recent activity</p> : (
                <ul className="space-y-2">
                  {recent.map((r, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-base-200 pb-2">
                      <span>{r.t}</span><span className="opacity-60 text-xs">{fmtDateTime(r.d)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="card bg-base-100 shadow stat-card">
            <div className="card-body">
              <h3 className="font-bold mb-3">Quick actions</h3>
              <Link to="/teacher/create-quiz" className="btn btn-block mb-2 btn-primary">+ Create Quiz</Link>
              <Link to="/teacher/concerns" className="btn btn-block btn-outline mb-2">View Concerns</Link>
              <Link to="/teacher/report" className="btn btn-block btn-warning">Send Report</Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
