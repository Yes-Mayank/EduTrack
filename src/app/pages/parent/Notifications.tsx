import { useState } from "react";
import { PageShell, EmptyState } from "../../components/PageShell";
import { useAuth } from "../../lib/auth";
import { storage, KEYS, type Notification } from "../../lib/storage";
import { fmtDateTime, toast } from "../../lib/utils";

const ICONS = { result: "📊", message: "💬", announcement: "📢", test: "📝" } as const;

export function NotificationsPage() {
  const { user } = useAuth();
  const seed: Notification[] = [
    { id: "n1", userId: user!.id, title: "New result available", description: "Algebra Basics quiz scored 8/10", type: "result", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "n2", userId: user!.id, title: "Teacher message", description: "Mrs. Priya Sharma sent you a note", type: "message", read: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "n3", userId: user!.id, title: "Upcoming test reminder", description: "Photosynthesis Quiz in 2 days", type: "test", read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: "n4", userId: user!.id, title: "Annual function announcement", description: "On 15 Aug at 10 AM at school auditorium", type: "announcement", read: false, createdAt: new Date(Date.now() - 345600000).toISOString() },
  ];
  const stored = storage.get<Notification[]>(KEYS.notifications, []);
  const mine = stored.filter((n) => n.userId === user?.id);
  const initial = mine.length ? mine : seed;
  if (!mine.length) storage.set(KEYS.notifications, [...stored, ...seed]);

  const [list, setList] = useState<Notification[]>(initial);
  const [filter, setFilter] = useState<"all" | "unread" | "result" | "message" | "announcement">("all");

  const filtered = list.filter((n) => filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter);

  const markAllRead = () => {
    const next = list.map((n) => ({ ...n, read: true }));
    setList(next);
    const all = storage.get<Notification[]>(KEYS.notifications, []).map((n) => n.userId === user?.id ? { ...n, read: true } : n);
    storage.set(KEYS.notifications, all);
    toast("Marked all read");
  };

  return (
    <PageShell title="Notifications">
      <div className="flex flex-wrap gap-2 mb-3">
        {(["all", "unread", "result", "message", "announcement"] as const).map((f) => (
          <button key={f} className={`btn btn-xs capitalize ${filter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <button className="btn btn-xs btn-warning ml-auto" onClick={markAllRead}>Mark all read</button>
      </div>
      {filtered.length === 0 ? <EmptyState icon="🔔" title="No notifications" /> : (
        <div className="card bg-base-100 shadow"><ul className="divide-y">
          {filtered.map((n) => (
            <li key={n.id} className={`flex gap-3 p-4 ${!n.read ? "bg-warning/5" : ""}`}>
              <div className="text-2xl">{ICONS[n.type]}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold text-sm">{n.title}</div>
                  {!n.read && <span className="badge badge-warning badge-xs">new</span>}
                </div>
                <div className="text-sm opacity-80">{n.description}</div>
                <div className="text-xs opacity-50 mt-1">{fmtDateTime(n.createdAt)}</div>
              </div>
            </li>
          ))}
        </ul></div>
      )}
    </PageShell>
  );
}
