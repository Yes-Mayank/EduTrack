import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Navbar } from "./Navbar";

export function PageShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  }, []);
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main ref={ref} className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-base-content" style={{ fontFamily: "Poppins" }}>{title}</h1>
            {subtitle && <p className="text-base-content/70 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-base-content">{title}</h3>
      {subtitle && <p className="text-sm text-base-content/60 mt-2">{subtitle}</p>}
    </div>
  );
}
