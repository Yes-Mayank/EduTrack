import { useState } from "react";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../lib/auth";
import { initials, toast } from "../lib/utils";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [confP, setConfP] = useState("");

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, phone });
    toast("Profile updated");
  };

  const changePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldP !== user.password) { toast("Old password incorrect", "error"); return; }
    if (newP.length < 6) { toast("New password too short", "error"); return; }
    if (newP !== confP) { toast("Passwords do not match", "error"); return; }
    updateUser({ password: newP });
    setOldP(""); setNewP(""); setConfP("");
    toast("Password changed");
  };

  return (
    <PageShell title="My Profile" subtitle="Manage your account details">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center">
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: user.avatarColor || "#2C3639" }}>{initials(user.name)}</div>
            <h3 className="font-bold mt-3">{user.name}</h3>
            <div className="badge badge-outline capitalize">{user.role}</div>
            <p className="text-xs opacity-70">{user.email}</p>
            {user.role === "student" && <p className="text-xs">Roll {user.rollNo} · Class {user.className}</p>}
            {user.role === "parent" && <p className="text-xs">Child Roll: {user.childRollNo} · Class {user.className}</p>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-bold mb-2">Edit profile</h3>
              <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label py-1"><span className="label-text text-xs">Name</span></label>
                  <input className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label py-1"><span className="label-text text-xs">Email (read-only)</span></label>
                  <input className="input input-bordered w-full" value={user.email} readOnly />
                </div>
                <div>
                  <label className="label py-1"><span className="label-text text-xs">Phone</span></label>
                  <input className="input input-bordered w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="sm:col-span-2"><button className="btn" style={{ background: "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>Save changes</button></div>
              </form>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-bold mb-2">Change password</h3>
              <form onSubmit={changePwd} className="grid sm:grid-cols-3 gap-3">
                <input type="password" placeholder="Old password" className="input input-bordered" value={oldP} onChange={(e) => setOldP(e.target.value)} />
                <input type="password" placeholder="New password" className="input input-bordered" value={newP} onChange={(e) => setNewP(e.target.value)} />
                <input type="password" placeholder="Confirm" className="input input-bordered" value={confP} onChange={(e) => setConfP(e.target.value)} />
                <div className="sm:col-span-3"><button className="btn btn-warning">Update password</button></div>
              </form>
            </div>
          </div>
          {user.role === "teacher" && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="font-bold mb-2">EmailJS public key</h3>
                <p className="text-xs opacity-70 mb-2">Required to send report emails to parents. Get yours free at emailjs.com.</p>
                <EmailJsKey />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function EmailJsKey() {
  const [v, setV] = useState(typeof window !== "undefined" ? localStorage.getItem("stsv_emailjs_key") || "" : "");
  return (
    <div className="join w-full">
      <input className="input input-bordered join-item flex-1" placeholder="Your EmailJS public key" value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn join-item btn-warning" onClick={() => { localStorage.setItem("stsv_emailjs_key", v); toast("Saved"); }}>Save</button>
    </div>
  );
}
