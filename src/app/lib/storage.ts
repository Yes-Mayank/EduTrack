// LocalStorage helpers + seed data for STSV demo

export type Role = "teacher" | "student" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  className?: string;
  rollNo?: string;
  childRollNo?: string;
  avatarColor?: string;
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  marks: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  className: string;
  duration: number;
  totalMarks: number;
  scheduledAt: string;
  instructions: string;
  questions: Question[];
  status: "draft" | "scheduled" | "completed";
  teacherId: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  answers: Record<string, number>;
  score: number;
  totalMarks: number;
  timeTaken: number;
  submittedAt: string;
}

export interface Concern {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizName: string;
  questionNo: number;
  type: string;
  description: string;
  status: "open" | "under_review" | "resolved";
  resolution?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "result" | "message" | "announcement" | "test";
  read: boolean;
  createdAt: string;
}

export interface TeacherNote {
  studentId: string;
  teacherId: string;
  note: string;
  updatedAt: string;
}

const K = {
  users: "stsv_users",
  session: "stsv_session",
  quizzes: "stsv_quizzes",
  results: "stsv_results",
  concerns: "stsv_concerns",
  notifications: "stsv_notifications",
  notes: "stsv_notes",
  seeded: "stsv_seeded_v3",
  emailjs: "stsv_emailjs_key",
  theme: "stsv_theme",
};

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

export const KEYS = K;

const colors = ["#2C3639", "#A27B5C", "#3F4E4F", "#c97b00", "#1f4068", "#d97706"];
function color(i: number) { return colors[i % colors.length]; }

const id = () => Math.random().toString(36).slice(2, 10);

export function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K.seeded)) return;

  const teachers: User[] = [
    { id: "t1", name: "Mrs. Priya Sharma", email: "priya@stsv.edu", password: "stsv1234", role: "teacher", phone: "+91 9000000001", avatarColor: color(0) },
    { id: "t2", name: "Mr. Rajan Mehta", email: "rajan@stsv.edu", password: "stsv1234", role: "teacher", phone: "+91 9000000002", avatarColor: color(1) },
  ];
  const studentNames = ["Aarav Singh", "Neha Gupta", "Rohit Kumar", "Priya Yadav", "Amit Sharma"];
  const students: User[] = [101, 102, 103, 104, 105].map((roll, i) => ({
    id: `s${roll}`,
    name: studentNames[i],
    email: `student${roll}@stsv.edu`,
    password: "stsv1234",
    role: "student" as const,
    phone: `+91 99999000${roll}`,
    className: "10-A",
    rollNo: String(roll),
    avatarColor: color(i + 2),
  }));
  const parents: User[] = [
    { id: "p1", name: "Mr. Suresh Singh", email: "suresh@gmail.com", password: "stsv1234", role: "parent", phone: "+91 9111100101", childRollNo: "101", className: "10-A", avatarColor: color(3) },
    { id: "p2", name: "Mrs. Kavita Gupta", email: "kavita@gmail.com", password: "stsv1234", role: "parent", phone: "+91 9111100102", childRollNo: "102", className: "10-A", avatarColor: color(4) },
  ];

  const mkQ = (text: string, opts: [string, string, string, string], correct: 0|1|2|3, marks = 2): Question => ({
    id: id(), text, options: opts, correct, marks,
  });

  const quizzes: Quiz[] = [
    {
      id: "q1", title: "Algebra Basics", subject: "Mathematics", className: "10-A",
      duration: 20, totalMarks: 10, scheduledAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      instructions: "Answer all questions. No calculator.", teacherId: "t1",
      status: "completed", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      questions: [
        mkQ("Solve: 2x + 5 = 15", ["x = 3", "x = 5", "x = 7", "x = 10"], 1),
        mkQ("Factor: x² - 9", ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+9)(x-1)"], 0),
        mkQ("If y = 2x + 1, find y when x = 4", ["7", "8", "9", "10"], 2),
        mkQ("What is √81?", ["7", "8", "9", "10"], 2),
        mkQ("Solve: 3x = 21", ["5", "6", "7", "8"], 2),
      ],
    },
    {
      id: "q2", title: "Photosynthesis Quiz", subject: "Science", className: "10-A",
      duration: 15, totalMarks: 8, scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      instructions: "Read each question carefully.", teacherId: "t1",
      status: "scheduled", createdAt: new Date().toISOString(),
      questions: [
        mkQ("Photosynthesis occurs in?", ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], 1),
        mkQ("Main pigment for photosynthesis?", ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"], 1),
        mkQ("Byproduct of photosynthesis?", ["CO₂", "Nitrogen", "Oxygen", "Hydrogen"], 2),
        mkQ("Required for photosynthesis?", ["Moonlight", "Sunlight", "Heat", "Wind"], 1),
      ],
    },
    {
      id: "q3", title: "World War II Draft", subject: "History", className: "10-A",
      duration: 25, totalMarks: 10, scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      instructions: "Draft - not yet published.", teacherId: "t1",
      status: "draft", createdAt: new Date().toISOString(),
      questions: [
        mkQ("WWII started in?", ["1935", "1939", "1941", "1945"], 1),
      ],
    },
  ];

  const results: QuizResult[] = students.map((s, i) => {
    const score = [8, 6, 9, 5, 7][i];
    return {
      id: id(), quizId: "q1", studentId: s.id, studentRoll: s.rollNo!, studentName: s.name,
      answers: { [quizzes[0].questions[0].id]: 1, [quizzes[0].questions[1].id]: 0 },
      score, totalMarks: 10, timeTaken: 12 + i,
      submittedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    };
  });

  const concerns: Concern[] = [
    {
      id: id(), studentId: "s101", studentName: "Aarav Singh", quizId: "q1", quizName: "Algebra Basics",
      questionNo: 2, type: "Unclear Question", description: "Question 2 has ambiguous wording.",
      status: "open", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: id(), studentId: "s102", studentName: "Neha Gupta", quizId: "q1", quizName: "Algebra Basics",
      questionNo: 4, type: "Wrong Answer Key", description: "I believe the correct answer is 9.",
      status: "open", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  storage.set(K.users, [...teachers, ...students, ...parents]);
  storage.set(K.quizzes, quizzes);
  storage.set(K.results, results);
  storage.set(K.concerns, concerns);
  storage.set(K.notifications, []);
  storage.set(K.notes, []);
  localStorage.setItem(K.seeded, "1");
}
