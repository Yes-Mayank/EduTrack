import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { initials } from "../lib/utils";
import { storage, KEYS, type Notification } from "../lib/storage";
import PillNav from "../../components/PillNav/PillNav";
import logoUrl from "../../assets/stsv-logo.png";

const LINKS: Record<string, { to: string; label: string }[]> = {
  teacher: [
    { to: "/teacher", label: "Dashboard" },
    { to: "/teacher/students", label: "Students" },
    { to: "/teacher/create-quiz", label: "Create" },
    { to: "/teacher/tests", label: "Tests" },
    { to: "/teacher/results", label: "Results" },
    { to: "/teacher/report", label: "Report" },
    { to: "/teacher/concerns", label: "Concerns" },
  ],
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/student/tests", label: "Tests" },
    { to: "/student/results", label: "Results" },
    { to: "/student/performance", label: "Performance" },
    { to: "/student/concern", label: "Concern" },
  ],
  parent: [
    { to: "/parent", label: "Dashboard" },
    { to: "/parent/results", label: "Results" },
    { to: "/parent/performance", label: "Performance" },
    { to: "/parent/contact", label: "Contact" },
    { to: "/parent/notifications", label: "Alerts" },
  ],
};

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: "var(--stsv-ink)", color: "var(--stsv-accent)", boxShadow: "var(--stsv-shadow)" }}>
      STSV
    </div>
  );
}

const applyTheme = (t: string) => {
  document.documentElement.setAttribute("data-theme", t);
  if (t === "stsvdark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [theme, setTheme] = useState(typeof window !== "undefined" ? localStorage.getItem(KEYS.theme) || "stsv" : "stsv");
  const [unread, setUnread] = useState(0);

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    if (!user) return;
    const notifs = storage.get<Notification[]>(KEYS.notifications, []);
    setUnread(notifs.filter((n) => n.userId === user.id && !n.read).length);
  }, [user, loc.pathname]);

  const toggleTheme = () => {
    const t = theme === "stsv" ? "stsvdark" : "stsv";
    setTheme(t);
    applyTheme(t);
    localStorage.setItem(KEYS.theme, t);
  };

  if (!user) return null;
  const links = LINKS[user.role];
  const pillItems = useMemo(() => links.map((l) => ({ label: l.label, href: l.to })), [links]);

  const trailing = (
    <>
      <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm" aria-label="Toggle theme">
        {theme === "stsv" ? "🌙" : "☀️"}
      </button>
      <div className="indicator">
        {unread > 0 && <span className="indicator-item badge badge-warning badge-xs">{unread}</span>}
        <button className="btn btn-ghost btn-circle btn-sm">🔔</button>
      </div>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm avatar placeholder">
          <div className="w-8 rounded-full" style={{ background: user.avatarColor || "var(--stsv-accent)", color: "var(--stsv-accent-on)" }}>
            <span className="text-xs font-bold">{initials(user.name)}</span>
          </div>
        </div>
        <ul tabIndex={0} className="mt-2 z-[70] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-56 text-base-content">
          <li className="menu-title"><span>{user.name}</span></li>
          <li><Link to={`/${user.role}/profile`}>Profile</Link></li>
          <li><a onClick={() => { logout(); navigate("/"); }}>Logout</a></li>
        </ul>
      </div>
    </>
  );

  return (
    <div className="w-full py-3" style={{ background: "transparent" }}>
      <style>{`
        .pill-nav .pill,
        .pill-nav .pill *,
        .pill-nav .mobile-menu-link,
        .pill-nav .mobile-menu-button,
        .pill-nav .pill-logo {
          animation: none !important;
          animation-iteration-count: 1 !important;
        }
      `}</style>
      <PillNav
        logo={logoUrl}
        logoAlt="STSV International"
        items={pillItems}
        activeHref={loc.pathname}
        baseColor="#1C2B35"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#1C2B35"
        ease="power2.easeOut"
        initialLoadAnimation
        trailing={trailing}
      />
    </div>
  );
}
