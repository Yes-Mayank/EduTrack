import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, KEYS, seedIfNeeded, type User, type Role } from "./storage";

interface AuthCtx {
  user: User | null;
  login: (identifier: string, password: string, role: Role, extra?: { childRollNo?: string }) => { ok: boolean; error?: string };
  register: (data: Omit<User, "id" | "avatarColor">) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const COLORS = ["#2C3639", "#A27B5C", "#3F4E4F", "#c97b00", "#1f4068"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    seedIfNeeded();
    const session = storage.get<User | null>(KEYS.session, null);
    if (session) setUser(session);
  }, []);

  const login: AuthCtx["login"] = (identifier, password, role, extra) => {
    const users = storage.get<User[]>(KEYS.users, []);
    const id = identifier.trim().toLowerCase();
    const u = users.find((x) => {
      if (x.role !== role || x.password !== password) return false;
      if (role === "student") return x.rollNo === identifier.trim() || x.email.toLowerCase() === id;
      return x.email.toLowerCase() === id;
    });
    if (!u) return { ok: false, error: "Invalid credentials for this role." };
    if (role === "parent" && extra?.childRollNo && u.childRollNo !== extra.childRollNo.trim()) {
      return { ok: false, error: "Child's roll number does not match this parent account." };
    }
    setUser(u);
    storage.set(KEYS.session, u);
    return { ok: true };
  };

  const register: AuthCtx["register"] = (data) => {
    const users = storage.get<User[]>(KEYS.users, []);
    if (users.some((x) => x.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "Email already registered." };
    }
    if (data.role === "parent") {
      const childExists = users.some((u) => u.role === "student" && u.rollNo === data.childRollNo);
      if (!childExists) return { ok: false, error: "No student found with this Roll Number. Please check and try again." };
    }
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).slice(2, 10),
      avatarColor: COLORS[users.length % COLORS.length],
    };
    storage.set(KEYS.users, [...users, newUser]);
    setUser(newUser);
    storage.set(KEYS.session, newUser);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    storage.remove(KEYS.session);
    navigate("/");
  };

  const updateUser: AuthCtx["updateUser"] = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    setUser(next);
    storage.set(KEYS.session, next);
    const users = storage.get<User[]>(KEYS.users, []);
    storage.set(KEYS.users, users.map((u) => (u.id === next.id ? next : u)));
  };

  return <Ctx.Provider value={{ user, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
