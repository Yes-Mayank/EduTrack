import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Logo } from "../components/Navbar";
import type { Role } from "../lib/storage";

interface CardProps {
  role: Role;
  accent: string;
  icon: string;
  title: string;
  identifierLabel: string;
  identifierType?: string;
  showChild?: boolean;
}

function RoleCard({ role, accent, icon, title, identifierLabel, identifierType = "text", showChild }: CardProps) {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [pwd, setPwd] = useState("");
  const [child, setChild] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!identifier || !pwd || (showChild && !child)) { setErr("All fields are required."); return; }
    setLoading(true);
    setTimeout(() => {
      const r = login(identifier, pwd, role, showChild ? { childRollNo: child } : undefined);
      setLoading(false);
      if (!r.ok) { setErr(r.error || "Login failed."); return; }
      const from = (loc.state as { from?: { pathname: string } })?.from?.pathname;
      nav(from || `/${role}`);
    }, 300);
  };

  return (
    <div className="card bg-base-100 shadow-2xl border-t-4" style={{ borderTopColor: accent }}>
      <form onSubmit={submit} className="card-body p-5 space-y-3 text-base-content">
        <div className="text-center">
          <div className="text-4xl mb-1">{icon}</div>
          <h3 className="font-bold text-lg" style={{ fontFamily: "Poppins", color: "var(--stsv-accent)" }}>{title}</h3>
        </div>
        <div>
          <label className="label py-1"><span className="label-text text-xs font-semibold">{identifierLabel}</span></label>
          <input 
            type={identifierType} 
            className="input input-bordered input-sm w-full bg-base-200/50 border-neutral-300 focus:border-primary focus:bg-base-100 text-base-content" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
          />
        </div>
        <div>
          <label className="label py-1"><span className="label-text text-xs font-semibold">Password</span></label>
          <input 
            type="password" 
            className="input input-bordered input-sm w-full bg-base-200/50 border-neutral-300 focus:border-primary focus:bg-base-100 text-base-content" 
            value={pwd} 
            onChange={(e) => setPwd(e.target.value)} 
          />
        </div>
        {showChild && (
          <div>
            <label className="label py-1"><span className="label-text text-xs font-semibold">Child's Roll Number</span></label>
            <input 
              className="input input-bordered input-sm w-full bg-base-200/50 border-neutral-300 focus:border-primary focus:bg-base-100 text-base-content" 
              value={child} 
              onChange={(e) => setChild(e.target.value)} 
              placeholder="e.g. 101" 
            />
          </div>
        )}
        {err && <div className="alert alert-error text-xs py-2">{err}</div>}
        <button type="submit" disabled={loading} className="btn btn-sm btn-block btn-primary mt-2">
          {loading ? <span className="loading loading-spinner loading-sm" /> : title}
        </button>
      </form>
    </div>
  );
}

export function Login() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole = (searchParams.get("role") || "student") as Role;

  const handleRoleChange = (role: Role) => {
    setSearchParams({ role });
  };

  return (
    <div className="min-h-screen animated-bg py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => nav("/")}
            className="btn btn-sm gap-2"
            style={{ background: "var(--stsv-card)", color: "var(--stsv-ink)", border: "1px solid var(--stsv-accent)" }}
          >
            ← Back to Home
          </button>
        </div>

        <div className="flex flex-col items-center mb-6 text-white text-center">
          <Logo size="lg" />
          <h2 className="text-2xl font-bold mt-3" style={{ fontFamily: "Poppins" }}>Welcome to STSV International</h2>
          <p className="text-sm opacity-90">Log in to your dashboard</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl flex gap-1 w-full">
            <button
              onClick={() => handleRoleChange("student")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeRole === "student" ? "bg-white text-gray-900 shadow" : "text-white hover:bg-white/10"}`}
            >
              🎓 Student
            </button>
            <button
              onClick={() => handleRoleChange("teacher")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeRole === "teacher" ? "bg-white text-gray-900 shadow" : "text-white hover:bg-white/10"}`}
            >
              👨‍🏫 Teacher
            </button>
            <button
              onClick={() => handleRoleChange("parent")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeRole === "parent" ? "bg-white text-gray-900 shadow" : "text-white hover:bg-white/10"}`}
            >
              👨‍👩‍👧 Parent
            </button>
          </div>
        </div>

        <div>
          {activeRole === "student" && (
            <RoleCard role="student" accent="#3D4D55" icon="🎓" title="Login as Student" identifierLabel="Roll Number" />
          )}
          {activeRole === "teacher" && (
            <RoleCard role="teacher" accent="#1C2B35" icon="👨‍🏫" title="Login as Teacher" identifierLabel="Email" identifierType="email" />
          )}
          {activeRole === "parent" && (
            <RoleCard role="parent" accent="#B58863" icon="👨‍👩‍👧" title="Login as Parent" identifierLabel="Email" identifierType="email" showChild />
          )}
        </div>

        <div className="text-center mt-6 text-white text-sm">
          New here? <Link to="/register" className="link link-warning font-semibold">Create an account</Link>
          <span className="mx-2 opacity-50">·</span>
          <Link to="/" className="link link-warning">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
