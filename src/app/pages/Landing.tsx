import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../lib/auth";
import { Logo } from "../components/Navbar";
import Prism from "@/components/Prism/Prism";



export function Landing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "STSV International Sr. Secondary School";
    if (user) { nav(`/${user.role}`); return; }
    const tl = gsap.timeline();
    tl.fromTo(".hero-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
      .fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.3")
      .fromTo(".feat-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, "-=0.2");
  }, [user, nav]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative text-white overflow-hidden flex-1 flex items-center stsv-hero-flow"
        style={{ minHeight: "100vh" }}
      >
        {/* Prism WebGL background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Prism animationType="rotate" timeScale={0.5} scale={3.6} glow={1} noise={0.3} hueShift={0} colorFrequency={1} bloom={1} />
        </div>
        {/* Dark overlay for readability */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "var(--stsv-overlay)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[auto_1fr] gap-8 items-center" style={{ zIndex: 10 }}>
          <div className="flex justify-center lg:justify-start">
            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full flex items-center justify-center font-black text-4xl lg:text-6xl"
              style={{ background: "var(--stsv-card)", color: "var(--stsv-ink)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: "6px solid var(--stsv-accent)" }}>
              STSV
            </div>
          </div>
          <div className="text-center lg:text-left">
            <div className="badge badge-warning mb-4 font-semibold">Est. — Dhanupra, Arrah, Bihar (802301)</div>
            <h1 className="hero-title text-4xl md:text-6xl font-black leading-tight text-white" style={{ fontFamily: "Poppins" }}>
              STSV International<br /><span style={{ color: "var(--stsv-accent)" }}>Sr. Secondary School</span>
            </h1>
            <p className="hero-sub mt-4 text-lg md:text-2xl text-white/80 italic">"Illuminating Minds, Building Futures"</p>
            <div className="hero-cta mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/login?role=student" className="btn btn-primary btn-lg font-bold">Student Login</Link>
              <Link to="/login?role=teacher" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-base-content">Teacher Login</Link>
              <Link to="/login?role=parent" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-base-content">Parent Login</Link>
              <Link to="/register" className="btn btn-lg bg-white/5 backdrop-blur text-white border-white/40 hover:bg-white/20">Register</Link>
            </div>
          </div>
        </div>
      </section>


      {/* FEATURES */}
      <section ref={featRef} className="py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-base-content" style={{ fontFamily: "Poppins" }}>
            A modern school, digitally connected
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📝", t: "Digital Exams", d: "Teachers create timed quizzes, students attempt them online with auto-grading." },
              { icon: "⚡", t: "Instant Results", d: "Marks, grades, and detailed reviews delivered the moment a test ends." },
              { icon: "👨‍👩‍👧", t: "Parent Connect", d: "Parents see every quiz result and message teachers directly — no more paper slips." },
            ].map((f) => (
              <div key={f.t} className="feat-card card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow" style={{ border: "1px solid var(--stsv-border)" }}>
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-2" style={{ color: "var(--stsv-accent)" }}>{f.icon}</div>
                  <h3 className="card-title text-base-content">{f.t}</h3>
                  <p className="text-sm opacity-80">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer className="p-10" style={{ background: "var(--stsv-surface)", color: "var(--stsv-ink-soft)", borderTop: "2px solid var(--stsv-accent)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-lg" style={{ color: "var(--stsv-ink)" }}>STSV International Sr. Secondary School</p>
            <p className="text-xs" style={{ color: "var(--stsv-ink-soft)" }}>Dhanupra, Arrah, Bihar (802301) · +91 9000000000 · info@stsv.edu</p>
            <p className="text-xs mt-1 opacity-70">© 2025 STSV International Sr. Secondary School. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 text-xl" style={{ color: "var(--stsv-accent)" }}>
            <a className="hover:opacity-70 cursor-pointer">🌐</a>
            <a className="hover:opacity-70 cursor-pointer">📘</a>
            <a className="hover:opacity-70 cursor-pointer">📷</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
