import { useState } from "react";
import emailjs from "@emailjs/browser";
import { PageShell } from "../../components/PageShell";
import { storage, KEYS, type User } from "../../lib/storage";
import { fmtDateTime, toast } from "../../lib/utils";

interface SentMsg { id: string; to: string; subject: string; date: string; status: string }

export function ContactTeacher() {
  const teachers = storage.get<User[]>(KEYS.users, []).filter((u) => u.role === "teacher");
  const [to, setTo] = useState(teachers[0]?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<SentMsg[]>(storage.get<SentMsg[]>("stsv_sent_msgs", []));

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const key = localStorage.getItem("stsv_emailjs_key");
    let status = "Demo (no EmailJS key)";
    if (key) {
      try {
        await emailjs.send("service_stsv", "template_report", { to_email: to, subject, message }, { publicKey: key });
        status = "Sent";
      } catch { status = "Failed"; }
    }
    const m: SentMsg = { id: Math.random().toString(36).slice(2), to, subject, date: new Date().toISOString(), status };
    const all = [m, ...sent];
    setSent(all); storage.set("stsv_sent_msgs", all);
    setSubject(""); setMessage("");
    setLoading(false);
    toast(status);
  };

  return (
    <PageShell title="Contact Teacher">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow"><form onSubmit={send} className="card-body space-y-3">
          <div>
            <label className="label py-1 text-xs">To (teacher)</label>
            <select className="select select-bordered w-full" value={to} onChange={(e) => setTo(e.target.value)}>
              {teachers.map((t) => <option key={t.id} value={t.email}>{t.name} — {t.email}</option>)}
            </select>
          </div>
          <div><label className="label py-1 text-xs">Subject</label><input className="input input-bordered w-full" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
          <div><label className="label py-1 text-xs">Message</label><textarea className="textarea textarea-bordered w-full" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
          <button disabled={loading} className="btn" style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>{loading ? <span className="loading loading-spinner loading-sm" /> : "Send"}</button>
        </form></div>

        <div className="card bg-base-100 shadow"><div className="card-body">
          <h3 className="font-bold mb-2">Sent messages</h3>
          {sent.length === 0 ? <p className="text-sm opacity-60">No messages sent yet.</p> :
            <ul className="space-y-2 text-sm">
              {sent.map((m) => (
                <li key={m.id} className="border-b pb-2">
                  <div className="font-semibold">{m.subject}</div>
                  <div className="text-xs opacity-70">To {m.to} · {fmtDateTime(m.date)}</div>
                  <div className="badge badge-sm">{m.status}</div>
                </li>
              ))}
            </ul>}
        </div></div>
      </div>
    </PageShell>
  );
}
