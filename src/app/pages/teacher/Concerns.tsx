import { useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { storage, KEYS, type Concern } from "../../lib/storage";
import { fmtDate, toast } from "../../lib/utils";

export function TeacherConcerns() {
  const [concerns, setConcerns] = useState<Concern[]>(storage.get<Concern[]>(KEYS.concerns, []));
  const [active, setActive] = useState<Concern | null>(null);
  const [res, setRes] = useState("");

  const update = (id: string, patch: Partial<Concern>) => {
    const next = concerns.map((c) => c.id === id ? { ...c, ...patch } : c);
    setConcerns(next);
    storage.set(KEYS.concerns, next);
  };

  const resolve = () => {
    if (!active) return;
    update(active.id, { status: "resolved", resolution: res });
    toast("Concern resolved");
    setActive(null); setRes("");
  };

  return (
    <PageShell title="Concerns" subtitle="Student tickets and objections">
      {concerns.length === 0 ? <EmptyState icon="✅" title="No concerns" /> : (
        <div className="grid gap-3">
          {concerns.map((c) => (
            <div key={c.id} className={`card shadow border-l-4 ${c.status === "resolved" ? "border-success bg-success/5" : "border-warning bg-warning/5"}`}>
              <div className="card-body p-4">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-sm">{c.studentName} · {c.quizName} · Q{c.questionNo}</h3>
                    <p className="text-xs opacity-70">{c.type} · {fmtDate(c.createdAt)}</p>
                    <p className="text-sm mt-2">{c.description}</p>
                    {c.resolution && <p className="text-xs italic opacity-80 mt-1">Resolution: {c.resolution}</p>}
                  </div>
                  <span className={`badge ${c.status === "resolved" ? "badge-success" : "badge-warning"}`}>{c.status}</span>
                </div>
                {c.status !== "resolved" && (
                  <div className="card-actions justify-end mt-2">
                    <button className="btn btn-xs" onClick={() => { setActive(c); setRes(""); }}>Respond</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold">Resolve concern</h3>
            <p className="text-sm opacity-70 mt-1">{active.description}</p>
            <textarea className="textarea textarea-bordered w-full mt-3" placeholder="Resolution note..." value={res} onChange={(e) => setRes(e.target.value)} />
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)}>Cancel</button>
              <button className="btn btn-success btn-sm" onClick={resolve}>Mark Resolved</button>
            </div>
          </div>
        </dialog>
      )}
    </PageShell>
  );
}
