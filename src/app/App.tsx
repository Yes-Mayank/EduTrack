import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { setToastFn } from "./lib/utils";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { TeacherDashboard } from "./pages/teacher/Dashboard";
import { MyStudents } from "./pages/teacher/MyStudents";
import { CreateQuiz } from "./pages/teacher/CreateQuiz";
import { ScheduledTests } from "./pages/teacher/ScheduledTests";
import { ResultsMarks } from "./pages/teacher/ResultsMarks";
import { SendReport } from "./pages/teacher/SendReport";
import { TeacherConcerns } from "./pages/teacher/Concerns";
import { StudentDashboard } from "./pages/student/Dashboard";
import { MyTests } from "./pages/student/MyTests";
import { TakeQuiz } from "./pages/student/TakeQuiz";
import { MyResults } from "./pages/student/MyResults";
import { Performance } from "./pages/student/Performance";
import { RaiseConcern } from "./pages/student/RaiseConcern";
import { ParentDashboard } from "./pages/parent/Dashboard";
import { ChildResults } from "./pages/parent/ChildResults";
import { ParentPerformance } from "./pages/parent/Performance";
import { ContactTeacher } from "./pages/parent/ContactTeacher";
import { NotificationsPage } from "./pages/parent/Notifications";
import { ToastHost } from "./components/Toast";

function Protected({ role, children }: { role: "teacher" | "student" | "parent"; children: React.ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function ThemeBoot() {
  useEffect(() => {
    const t = localStorage.getItem("stsv_theme") || "light";
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  return null;
}

function ToastBridge() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  useEffect(() => {
    setToastFn((msg, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    });
  }, []);
  return <ToastHost toasts={toasts} />;
}

export function SPAApp() {
  if (typeof window === "undefined") {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading STSV…</div>;
  }
  return (
    <BrowserRouter>
      <ThemeBoot />
      <AuthProvider>
        <ToastBridge />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/teacher" element={<Protected role="teacher"><TeacherDashboard /></Protected>} />
          <Route path="/teacher/students" element={<Protected role="teacher"><MyStudents /></Protected>} />
          <Route path="/teacher/create-quiz" element={<Protected role="teacher"><CreateQuiz /></Protected>} />
          <Route path="/teacher/tests" element={<Protected role="teacher"><ScheduledTests /></Protected>} />
          <Route path="/teacher/results" element={<Protected role="teacher"><ResultsMarks /></Protected>} />
          <Route path="/teacher/report" element={<Protected role="teacher"><SendReport /></Protected>} />
          <Route path="/teacher/concerns" element={<Protected role="teacher"><TeacherConcerns /></Protected>} />
          <Route path="/teacher/profile" element={<Protected role="teacher"><Profile /></Protected>} />

          <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/tests" element={<Protected role="student"><MyTests /></Protected>} />
          <Route path="/student/take/:quizId" element={<Protected role="student"><TakeQuiz /></Protected>} />
          <Route path="/student/results" element={<Protected role="student"><MyResults /></Protected>} />
          <Route path="/student/performance" element={<Protected role="student"><Performance /></Protected>} />
          <Route path="/student/concern" element={<Protected role="student"><RaiseConcern /></Protected>} />
          <Route path="/student/profile" element={<Protected role="student"><Profile /></Protected>} />

          <Route path="/parent" element={<Protected role="parent"><ParentDashboard /></Protected>} />
          <Route path="/parent/results" element={<Protected role="parent"><ChildResults /></Protected>} />
          <Route path="/parent/performance" element={<Protected role="parent"><ParentPerformance /></Protected>} />
          <Route path="/parent/contact" element={<Protected role="parent"><ContactTeacher /></Protected>} />
          <Route path="/parent/notifications" element={<Protected role="parent"><NotificationsPage /></Protected>} />
          <Route path="/parent/profile" element={<Protected role="parent"><Profile /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
