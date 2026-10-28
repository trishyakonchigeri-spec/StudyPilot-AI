
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// =====================================
// TYPES
// =====================================

type User = {
  id: number;
  name: string;
  email: string;
};

type Stats = {
  totalNotes: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
};

type Document = {
  id: number;
  fileName: string;
  createdAt: string;
};

type QuizResult = {
  id: number;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
};

type QuizStats = {
  count: number;
  average: number;
  best: number;
};

// =====================================
// DASHBOARD
// =====================================

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalNotes: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });

  const [documents, setDocuments] = useState<Document[]>([]);

  const [quizStats, setQuizStats] = useState<QuizStats>({
    count: 0,
    average: 0,
    best: 0,
  });

  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const [loading, setLoading] = useState(true);

  // =====================================
  // LOAD DASHBOARD
  // =====================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        // USER

        const userResponse = await fetch("/api/auth/me");

        if (!userResponse.ok) {
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();

        setUser(userData.user);

        // DASHBOARD STATS

        const statsResponse = await fetch("/api/dashboard");

        if (statsResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();

          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

        // DOCUMENTS

        const documentsResponse = await fetch("/api/documents");

        if (documentsResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();

          if (documentsData.success) {
            setDocuments(documentsData.documents);
          }
        }

        // QUIZ RESULTS

        try {
          const quizResponse = await fetch("/api/quiz-result");

          if (quizResponse.status === 401) {
            router.push("/login");
            return;
          }

          if (quizResponse.ok) {
            const quizData = await quizResponse.json();

            if (
              quizData.success &&
              Array.isArray(quizData.results)
            ) {
              const results =
                quizData.results as QuizResult[];

              setQuizResults(results);

              if (results.length > 0) {
                const average = Math.round(
                  results.reduce(
                    (sum, result) =>
                      sum + Number(result.percentage),
                    0
                  ) / results.length
                );

                const best = Math.max(
                  ...results.map((result) =>
                    Number(result.percentage)
                  )
                );

                setQuizStats({
                  count: results.length,
                  average,
                  best,
                });
              }
            }
          }
        } catch (quizError) {
          console.error(
            "QUIZ RESULTS LOAD ERROR:",
            quizError
          );
        }
      } catch (error) {
        console.error(
          "DASHBOARD LOAD ERROR:",
          error
        );

        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // =====================================
  // LOGOUT
  // =====================================

  async function handleLogout() {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        console.error("Logout failed");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  }

  // =====================================
  // QUIZ GRAPH
  // =====================================

  const chartResults = useMemo(() => {
    return quizResults.slice(0, 7).reverse();
  }, [quizResults]);

  // =====================================
  // DAILY PROGRESS
  // =====================================

  const taskProgress =
    stats.totalTasks > 0
      ? Math.round(
          (stats.completedTasks /
            stats.totalTasks) *
            100
        )
      : 0;

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="relative mx-auto w-16 h-16 mb-6">

            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />

            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl">
              🧠
            </div>

          </div>

          <p className="text-slate-400">
            Preparing your study space...
          </p>

        </div>

      </main>
    );
  }

  if (!user) {
    return null;
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-hidden">

      {/* =================================
          BACKGROUND
      ================================= */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute top-[-200px] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="absolute top-[500px] right-[-200px] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      </div>

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-2xl">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="absolute inset-0 bg-blue-500/30 blur-lg rounded-xl" />

              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg">
                🧠
              </div>

            </div>

            <div>

              <h1 className="text-xl font-bold tracking-tight">
                StudyPilot
                <span className="text-blue-400">
                  AI
                </span>
              </h1>

              <p className="hidden sm:block text-[9px] text-slate-600 uppercase tracking-[0.25em]">
                Intelligent Learning
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push(
                  "/dashboard/chat"
                )
              }
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition"
            >
              <span>🤖</span>
              <span className="text-sm">
                Ask AI
              </span>
            </button>

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold">
                {user.name}
              </p>

              <p className="text-[11px] text-slate-500">
                Student
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold shadow-lg">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* =================================
          CONTENT
      ================================= */}

      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">

        {/* =================================
            HERO
        ================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-blue-950/40 via-[#0b1120] to-violet-950/30 p-7 md:p-10 mb-7">

          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px]" />

          <div className="absolute bottom-[-100px] left-[30%] w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px]" />

          <div className="relative">

            <div className="flex items-center gap-2 mb-5">

              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />

              <span className="text-xs font-medium text-emerald-400">
                YOUR AI STUDY SPACE IS READY
              </span>

            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">

              Good afternoon,{" "}

              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {user.name}
              </span>

              {" "}👋

            </h2>

            <p className="text-slate-400 mt-4 max-w-2xl text-base md:text-lg leading-7">
              Learn smarter, stay organized, and let
              StudyPilot AI turn your study material
              into knowledge.
            </p>

            {/* QUICK ACTIONS */}

            <div className="flex flex-wrap gap-3 mt-7">

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/chat"
                  )
                }
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                🤖 Ask AI
              </button>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/upload"
                  )
                }
                className="px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition"
              >
                📄 Upload PDF
              </button>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/generate-quiz"
                  )
                }
                className="px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition"
              >
                🧠 Generate Quiz
              </button>

              <button
                onClick={() =>
                  router.push("/pomodoro")
                }
                className="px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition"
              >
                ⏱ Focus Mode
              </button>

            </div>

          </div>

        </div>

        {/* =================================
            AI COMMAND CENTER + STREAK
        ================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

          {/* AI COMMAND CENTER */}

          <div className="lg:col-span-2 relative overflow-hidden rounded-[26px] border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-indigo-950/30 p-6">

            <div className="absolute right-[-60px] top-[-60px] w-52 h-52 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                  ✨
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    AI Study Command Center
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your personal AI learning assistant
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/chat"
                  )
                }
                className="w-full text-left rounded-2xl bg-black/20 border border-white/[0.07] px-5 py-4 hover:border-blue-500/30 transition group"
              >

                <div className="flex items-center justify-between">

                  <span className="text-slate-500 group-hover:text-slate-400">
                    Ask StudyPilot anything...
                  </span>

                  <span className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    →
                  </span>

                </div>

              </button>

              <div className="flex flex-wrap gap-2 mt-4">

                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-slate-400">
                  ⚡ Explain a topic
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-slate-400">
                  📚 Summarize PDF
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-slate-400">
                  🧠 Create Quiz
                </span>

              </div>

            </div>

          </div>

          {/* STREAK */}

          <div className="relative overflow-hidden rounded-[26px] border border-orange-500/20 bg-gradient-to-br from-orange-950/30 to-slate-900/80 p-6">

            <div className="absolute right-[-30px] top-[-30px] text-[130px] opacity-[0.04]">
              🔥
            </div>

            <p className="text-xs uppercase tracking-widest text-orange-400 font-medium">
              Study Streak
            </p>

            <div className="flex items-center justify-between mt-6">

              <div>

                <p className="text-6xl font-bold">
                  7
                </p>

                <p className="text-slate-500 mt-1">
                  consecutive days
                </p>

              </div>

              <div className="text-6xl">
                🔥
              </div>

            </div>

            <div className="mt-6">

              <div className="flex justify-between text-xs mb-2">

                <span className="text-slate-500">
                  Weekly goal
                </span>

                <span className="text-orange-400">
                  7 / 7
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                <div className="h-full w-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />

              </div>

            </div>

            <p className="text-xs text-slate-500 mt-4">
              🔥 Keep the momentum going!
            </p>

          </div>

        </div>

        {/* =================================
            OVERVIEW
        ================================= */}

        <div className="mb-7">

          <div className="flex items-end justify-between mb-5">

            <div>

              <p className="text-blue-400 text-xs uppercase tracking-widest font-medium">
                Overview
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Your Study Activity
              </h2>

            </div>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* NOTES */}

            <div className="group rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 hover:border-blue-500/30 hover:-translate-y-1 transition-all">

              <div className="flex justify-between">

                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">
                  📝
                </div>

                <span className="text-[10px] text-slate-600">
                  NOTES
                </span>

              </div>

              <p className="text-slate-500 text-sm mt-5">
                Total Notes
              </p>

              <p className="text-3xl font-bold mt-1">
                {stats.totalNotes}
              </p>

            </div>

            {/* PENDING */}

            <div className="group rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 hover:border-orange-500/30 hover:-translate-y-1 transition-all">

              <div className="flex justify-between">

                <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                  ⏳
                </div>

                <span className="text-[10px] text-slate-600">
                  PENDING
                </span>

              </div>

              <p className="text-slate-500 text-sm mt-5">
                Pending Tasks
              </p>

              <p className="text-3xl font-bold mt-1">
                {stats.pendingTasks}
              </p>

            </div>

            {/* COMPLETED */}

            <div className="group rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 hover:border-emerald-500/30 hover:-translate-y-1 transition-all">

              <div className="flex justify-between">

                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
                  ✅
                </div>

                <span className="text-[10px] text-slate-600">
                  DONE
                </span>

              </div>

              <p className="text-slate-500 text-sm mt-5">
                Completed
              </p>

              <p className="text-3xl font-bold mt-1">
                {stats.completedTasks}
              </p>

            </div>

            {/* TOTAL */}

            <div className="group rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 hover:border-violet-500/30 hover:-translate-y-1 transition-all">

              <div className="flex justify-between">

                <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl">
                  🎯
                </div>

                <span className="text-[10px] text-slate-600">
                  TOTAL
                </span>

              </div>

              <p className="text-slate-500 text-sm mt-5">
                Total Tasks
              </p>

              <p className="text-3xl font-bold mt-1">
                {stats.totalTasks}
              </p>

            </div>

          </div>

        </div>

        {/* =================================
            ANALYTICS
        ================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

          {/* QUIZ PERFORMANCE */}

          <div className="lg:col-span-2 rounded-[26px] border border-white/[0.06] bg-slate-900/60 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-xs text-blue-400 uppercase tracking-widest">
                  Performance
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Quiz Performance
                </h2>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/quiz-history"
                  )
                }
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                History →
              </button>

            </div>

            {chartResults.length > 0 ? (

              <div>

                <div className="flex items-end gap-3 h-44">

                  {chartResults.map(
                    (result, index) => {

                      const height = Math.max(
                        Number(
                          result.percentage
                        ),
                        5
                      );

                      return (
                        <div
                          key={result.id}
                          className="flex-1 h-full flex flex-col justify-end group"
                        >

                          <div className="relative w-full">

                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 opacity-70 group-hover:opacity-100 transition-all"
                              style={{
                                height: `${height * 1.35}px`,
                                maxHeight:
                                  "135px",
                              }}
                            />

                          </div>

                          <p className="text-[10px] text-slate-600 text-center mt-2">
                            Q{index + 1}
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">

                  <div>
                    <p className="text-xs text-slate-500">
                      Quizzes
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {quizStats.count}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Average
                    </p>

                    <p className="text-xl font-bold text-blue-400 mt-1">
                      {quizStats.average}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Best
                    </p>

                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      {quizStats.best}%
                    </p>
                  </div>

                </div>

              </div>

            ) : (

              <div className="h-52 flex flex-col items-center justify-center text-center">

                <div className="text-4xl mb-3">
                  📊
                </div>

                <p className="text-slate-400">
                  No quiz data yet
                </p>

                <p className="text-slate-600 text-sm mt-1">
                  Complete your first quiz to see your performance.
                </p>

              </div>

            )}

          </div>

          {/* DAILY GOAL */}

          <div className="rounded-[26px] border border-white/[0.06] bg-slate-900/60 p-6">

            <p className="text-xs text-violet-400 uppercase tracking-widest">
              Daily Goal
            </p>

            <h2 className="text-xl font-bold mt-1">
              Today's Progress
            </h2>

            <div className="flex justify-center mt-8">

              <div className="relative w-40 h-40">

                <div className="absolute inset-0 rounded-full border-[12px] border-slate-800" />

                <div
                  className="absolute inset-0 rounded-full border-[12px] border-violet-500"
                  style={{
                    clipPath:
                      taskProgress >= 100
                        ? "none"
                        : `polygon(50% 0%, 100% 0%, 100% ${taskProgress}%, 50% ${taskProgress}%, 50% 0%)`,
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">

                  <p className="text-3xl font-bold">
                    {taskProgress}%
                  </p>

                  <p className="text-xs text-slate-500">
                    completed
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-7">

              <div className="flex justify-between text-sm">

                <span className="text-slate-500">
                  Tasks completed
                </span>

                <span className="font-medium">
                  {stats.completedTasks}/
                  {stats.totalTasks}
                </span>

              </div>

              <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{
                    width: `${taskProgress}%`,
                  }}
                />

              </div>

            </div>

            <p className="text-xs text-slate-600 mt-5">
              🎯 Keep completing tasks to reach your daily goal.
            </p>

          </div>

        </div>

        {/* =================================
            DOCUMENTS
        ================================= */}

        {documents.length > 0 && (

          <div className="mb-8">

            <div className="flex items-end justify-between mb-5">

              <div>

                <p className="text-xs text-cyan-400 uppercase tracking-widest">
                  Library
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Continue Learning
                </h2>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/upload"
                  )
                }
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Add Material →
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {documents
                .slice(0, 3)
                .map((document) => (

                  <div
                    key={document.id}
                    className="group rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 hover:border-cyan-500/30 hover:-translate-y-1 transition-all"
                  >

                    <div className="flex items-start justify-between">

                      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center text-xl">
                        📄
                      </div>

                      <span className="text-xs text-slate-600">
                        PDF
                      </span>

                    </div>

                    <p className="font-semibold mt-5 truncate">
                      {document.fileName}
                    </p>

                    <p className="text-xs text-slate-600 mt-2">
                      Study material
                    </p>

                    <button
                      onClick={() =>
                        router.push(
                          "/dashboard/chat"
                        )
                      }
                      className="mt-5 w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-cyan-500/10 hover:border-cyan-500/20 text-sm transition"
                    >
                      Continue Learning →
                    </button>

                  </div>

                ))}

            </div>

          </div>

        )}

        {/* =================================
            STUDY TOOLS
        ================================= */}

        <div className="mb-10">

          <div className="mb-5">

            <p className="text-xs text-blue-400 uppercase tracking-widest">
              Workspace
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Your Study Tools
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* AI */}

            <StudyTool
              icon="🤖"
              title="AI PDF Assistant"
              description="Ask questions and understand your study material with AI."
              color="blue"
              button="Open Assistant"
              onClick={() =>
                router.push(
                  "/dashboard/chat"
                )
              }
              featured
            />

            {/* NOTES */}

            <StudyTool
              icon="📝"
              title="Notes"
              description="Create and organize your important study notes."
              color="blue"
              button="View Notes"
              onClick={() =>
                router.push("/notes")
              }
            />

            {/* TASKS */}

            <StudyTool
              icon="✅"
              title="Tasks"
              description="Manage assignments and daily study goals."
              color="green"
              button="View Tasks"
              onClick={() =>
                router.push("/tasks")
              }
            />

            {/* PLANNER */}

            <StudyTool
              icon="📅"
              title="Study Planner"
              description="Plan your schedule and stay consistent."
              color="violet"
              button="Open Planner"
              onClick={() =>
                router.push(
                  "/study-planner"
                )
              }
            />

            {/* POMODORO */}

            <StudyTool
              icon="⏱️"
              title="Pomodoro"
              description="Focus deeply with structured study sessions."
              color="orange"
              button="Start Focus"
              onClick={() =>
                router.push("/pomodoro")
              }
            />

            {/* PDF */}

            <StudyTool
              icon="📄"
              title="PDF Materials"
              description="Upload study material for AI analysis."
              color="cyan"
              button="Upload PDF"
              onClick={() =>
                router.push(
                  "/dashboard/upload"
                )
              }
            />

          </div>

        </div>

        {/* =================================
            QUIZ CTA
        ================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/30 p-7 md:p-8 mb-10">

          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                🧠
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-bold">
                    Ready to test yourself?
                  </h2>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium uppercase">
                    AI Powered
                  </span>

                </div>

                <p className="text-slate-400 text-sm mt-2 max-w-xl">
                  Choose one of your uploaded PDFs and
                  generate an interactive quiz automatically.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                router.push(
                  "/dashboard/generate-quiz"
                )
              }
              className="shrink-0 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 font-medium transition-all hover:-translate-y-0.5"
            >
              Generate Quiz →
            </button>

          </div>

        </div>

        {/* =================================
            ACHIEVEMENTS
        ================================= */}

        <div className="mb-12">

          <div className="mb-5">

            <p className="text-xs text-yellow-400 uppercase tracking-widest">
              Milestones
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Achievements
            </h2>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <Achievement
              icon="🔥"
              title="7 Day Streak"
              description="Keep showing up"
              active
            />

            <Achievement
              icon="🧠"
              title="Quiz Master"
              description="Complete quizzes"
              active={
                quizStats.count > 0
              }
            />

            <Achievement
              icon="📚"
              title="PDF Explorer"
              description="Upload materials"
              active={
                documents.length > 0
              }
            />

            <Achievement
              icon="🎯"
              title="Task Master"
              description="Complete your tasks"
              active={
                stats.completedTasks > 0
              }
            />

          </div>

        </div>

        {/* =================================
            FOOTER
        ================================= */}

        <footer className="border-t border-white/[0.05] pt-7 pb-5 text-center">

          <div className="flex items-center justify-center gap-2">

            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs">
              🧠
            </div>

            <span className="font-semibold">
              StudyPilot
              <span className="text-blue-400">
                AI
              </span>
            </span>

          </div>

          <p className="text-slate-600 text-xs mt-3">
            Learn smarter. Stay consistent. Build your future. 🚀
          </p>

        </footer>

      </section>

    </main>
  );
}

// =====================================
// STUDY TOOL COMPONENT
// =====================================

function StudyTool({
  icon,
  title,
  description,
  color,
  button,
  onClick,
  featured = false,
}: {
  icon: string;
  title: string;
  description: string;
  color:
    | "blue"
    | "green"
    | "violet"
    | "orange"
    | "cyan";
  button: string;
  onClick: () => void;
  featured?: boolean;
}) {
  const colors = {
    blue: {
      icon: "bg-blue-500/10 border-blue-500/10",
      hover: "hover:border-blue-500/30",
      button: "bg-blue-600 hover:bg-blue-500",
    },
    green: {
      icon: "bg-green-500/10 border-green-500/10",
      hover: "hover:border-green-500/30",
      button: "bg-green-600 hover:bg-green-500",
    },
    violet: {
      icon: "bg-violet-500/10 border-violet-500/10",
      hover: "hover:border-violet-500/30",
      button: "bg-violet-600 hover:bg-violet-500",
    },
    orange: {
      icon: "bg-orange-500/10 border-orange-500/10",
      hover: "hover:border-orange-500/30",
      button: "bg-orange-600 hover:bg-orange-500",
    },
    cyan: {
      icon: "bg-cyan-500/10 border-cyan-500/10",
      hover: "hover:border-cyan-500/30",
      button: "bg-cyan-600 hover:bg-cyan-500",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6 hover:-translate-y-1 ${theme.hover} transition-all duration-300 ${
        featured
          ? "bg-gradient-to-br from-blue-950/40 to-slate-900/70"
          : ""
      }`}
    >

      {featured && (
        <div className="absolute top-4 right-4">

          <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] uppercase tracking-wider">
            Recommended
          </span>

        </div>
      )}

      <div
        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${theme.icon}`}
      >
        {icon}
      </div>

      <h3 className="text-xl font-bold mt-5">
        {title}
      </h3>

      <p className="text-slate-400 text-sm leading-6 mt-2 min-h-[48px]">
        {description}
      </p>

      <button
        onClick={onClick}
        className={`mt-5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${theme.button}`}
      >
        {button} →
      </button>

    </div>
  );
}

// =====================================
// ACHIEVEMENT COMPONENT
// =====================================

function Achievement({
  icon,
  title,
  description,
  active,
}: {
  icon: string;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 text-center transition-all ${
        active
          ? "border-yellow-500/20 bg-yellow-500/[0.04]"
          : "border-white/[0.05] bg-slate-900/40 opacity-50"
      }`}
    >

      <div className="text-3xl mb-3">
        {icon}
      </div>

      <p className="font-semibold text-sm">
        {title}
      </p>

      <p className="text-[11px] text-slate-600 mt-1">
        {description}
      </p>

    </div>
  );
}

