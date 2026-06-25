import { useState } from "react";
import emailjs from "@emailjs/browser";
import { PageShell } from "../../components/PageShell";
import { toast } from "../../lib/utils";

export function SendReport() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Your child's recent quiz performance");
  const [body, setBody] = useState("Dear Parent,\n\nYour child [Name] scored [X] out of [Y] in the [Subject] quiz on [Date]. Grade: [Z].\n\nPlease contact us for any concerns.\n\nRegards,\nClass Teacher");
  const [loading, setLoading] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = localStorage.getItem("stsv_emailjs_key");
    if (!key) { toast("Add your EmailJS public key in Profile first", "error"); return; }
    setLoading(true);
    try {
      await emailjs.send("service_stsv", "template_report", { to_email: to, subject, message: body }, { publicKey: key });
      toast("Email sent");
    } catch {
      toast("EmailJS not configured - this is a demo send (no real email)", "info");
    }
    setLoading(false);
  };

  return (
    <PageShell title="Send Report" subtitle="Email a personalized report to a parent">
      <div className="card bg-base-100 shadow max-w-2xl">
        <form onSubmit={send} className="card-body space-y-3">
          <div>
            <label className="label py-1 text-xs">To (parent email)</label>
            <input type="email" className="input input-bordered w-full" value={to} onChange={(e) => setTo(e.target.value)} required />
          </div>
          <div>
            <label className="label py-1 text-xs">Subject</label>
            <input className="input input-bordered w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="label py-1 text-xs">Message</label>
            <textarea className="textarea textarea-bordered w-full" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <button disabled={loading} className="btn" style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Send Email"}
          </button>
          <p className="text-xs opacity-60">Uses EmailJS service_stsv / template_report. Configure your public key under Profile.</p>
        </form>
      </div>
    </PageShell>
  );
}
