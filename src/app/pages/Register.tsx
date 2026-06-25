import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Logo } from "../components/Navbar";
import type { Role } from "../lib/storage";
import { toast } from "../lib/utils";

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "student" as Role,
    className: "10-A", rollNo: "", childRollNo: "", phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (form.role === "student" && !form.rollNo) e.rollNo = "Required for students";
    if (form.role === "parent" && !form.childRollNo) e.childRollNo = "Child's roll required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const r = register({
        name: form.name, email: form.email, password: form.password, role: form.role,
        phone: form.phone,
        className: form.role !== "teacher" ? form.className : undefined,
        rollNo: form.role === "student" ? form.rollNo : undefined,
        childRollNo: form.role === "parent" ? form.childRollNo : undefined,
      });
      setLoading(false);
      if (!r.ok) { setErrors({ email: r.error || "Error" }); return; }
      toast("Account created!");
      nav(`/${form.role}`);
    }, 400);
  };

  const inp = (k: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="label py-1"><span className="label-text text-xs">{label}</span></label>
      <input type={type} value={form[k] as string} onChange={(e) => set(k, e.target.value)}
        className={`input input-bordered input-sm w-full ${errors[k] ? "input-error" : ""}`} />
      {errors[k] && <span className="text-error text-xs">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-bg">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-2">
            <Logo size="lg" />
            <h2 className="text-xl font-bold mt-2" style={{ fontFamily: "Poppins", color: "var(--stsv-accent)" }}>Create Account</h2>
          </div>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">{inp("name", "Full Name")}</div>
            <div className="col-span-2">{inp("email", "Email", "email")}</div>
            {inp("password", "Password", "password")}
            {inp("confirm", "Confirm Password", "password")}
            <div>
              <label className="label py-1"><span className="label-text text-xs">Role</span></label>
              <select className="select select-bordered select-sm w-full" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option>
              </select>
            </div>
            {inp("phone", "Phone Number")}
            {form.role !== "teacher" && inp("className", "Class (e.g. 10-A)")}
            {form.role === "student" && inp("rollNo", "Roll Number")}
            {form.role === "parent" && inp("childRollNo", "Child's Roll Number")}
            <button type="submit" disabled={loading} className="btn btn-primary col-span-2 mt-2">
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Register"}
            </button>
          </form>
          <div className="text-center text-xs mt-3">
            Already have an account? <Link to="/login" className="link link-primary">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
