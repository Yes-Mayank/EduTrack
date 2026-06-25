import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, EmptyState } from "../../components/PageShell";
import { storage, KEYS, type Quiz, type QuizResult } from "../../lib/storage";
import { useAuth } from "../../lib/auth";
import { fmtDateTime, toast } from "../../lib/utils";

export function ScheduledTests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "draft">("all");
  const [_, force] = useState(0);
  const all = storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => q.teacherId === user?.id);
  const results = storage.get<QuizResult[]>(KEYS.results, []);
  const quizzes = filter === "all" ? all : all.filter((q) => q.status === filter);

  const del = (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    storage.set(KEYS.quizzes, storage.get<Quiz[]>(KEYS.quizzes, []).filter((q) => q.id !== id));
    toast("Deleted");
    force((n) => n + 1);
  };
  const copyLink = (id: string) => { navigator.clipboard.writeText(`${window.location.origin}/student/take/${id}`); toast("Link copied"); };

  return (
    <PageShell title="Scheduled Tests" subtitle="All quizzes you've created">
      <div className="tabs tabs-boxed mb-4 w-fit">
        {(["all", "scheduled", "completed", "draft"] as const).map((f) => (
          <a key={f} className={`tab capitalize ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>{f}</a>
        ))}
      </div>
      {quizzes.length === 0 ? <EmptyState icon="📋" title="No quizzes yet" subtitle="Create your first quiz to get started" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => {
            const attempts = results.filter((r) => r.quizId === q.id).length;
            return (
              <div key={q.id} className="card bg-base-100 shadow hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-base">{q.title}</h3>
                    <span className={`badge badge-sm ${q.status === "scheduled" ? "badge-warning" : q.status === "completed" ? "badge-success" : "badge-ghost"}`}>{q.status}</span>
                  </div>
                  <p className="text-xs opacity-70">{q.subject} · Class {q.className}</p>
                  <p className="text-xs">📅 {fmtDateTime(q.scheduledAt)}</p>
                  <p className="text-xs">👥 {attempts} attempts</p>
                  <div className="card-actions justify-end mt-2 flex-wrap">
                    <Link to="/teacher/results" className="btn btn-xs btn-outline">View Results</Link>
                    <button className="btn btn-xs" onClick={() => toast("Edit available after re-publishing (demo)")}>Edit</button>
                    <button className="btn btn-xs" onClick={() => copyLink(q.id)}>Copy Link</button>
                    <button className="btn btn-xs btn-error" onClick={() => del(q.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
