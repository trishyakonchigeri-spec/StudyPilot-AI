
"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

export default function PomodoroPage() {
  // =====================================
  // TIMER SETTINGS
  // =====================================

  const STUDY_TIME = 25 * 60;

  const BREAK_TIME = 5 * 60;

  // =====================================
  // STATES
  // =====================================

  const [seconds, setSeconds] =
    useState(STUDY_TIME);

  const [isRunning, setIsRunning] =
    useState(false);

  const [mode, setMode] =
    useState<"study" | "break">(
      "study"
    );

  const [
    completedSessions,
    setCompletedSessions,
  ] = useState(0);

  // =====================================
  // TIMER LOGIC
  // =====================================

  useEffect(() => {
    // If timer is not running,
    // don't start interval

    if (!isRunning) {
      return;
    }

    const timer =
      setInterval(() => {
        setSeconds(
          (previousSeconds) => {
            // Timer reached zero

            if (
              previousSeconds <= 1
            ) {
              // Stop timer

              setIsRunning(false);

              // If study session completed

              if (
                mode === "study"
              ) {
                // Increase completed sessions

                setCompletedSessions(
                  (count) =>
                    count + 1
                );

                // Switch to break

                setMode("break");

                // Set break time

                return BREAK_TIME;
              }

              // If break completed,
              // switch back to study

              setMode("study");

              return STUDY_TIME;
            }

            // Continue countdown

            return (
              previousSeconds - 1
            );
          }
        );
      }, 1000);

    // Clear timer when component
    // is removed or state changes

    return () =>
      clearInterval(timer);

  }, [
    isRunning,
    mode,
  ]);

  // =====================================
  // CONVERT SECONDS TO MM:SS
  // =====================================

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;

  const formattedTime =
    `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;

  // =====================================
  // START / PAUSE TIMER
  // =====================================

  function toggleTimer() {
    setIsRunning(
      (previous) =>
        !previous
    );
  }

  // =====================================
  // RESET TIMER
  // =====================================

  function resetTimer() {
    setIsRunning(false);

    setMode("study");

    setSeconds(
      STUDY_TIME
    );
  }

  // =====================================
  // SWITCH BETWEEN STUDY / BREAK
  // =====================================

  function switchMode(
    newMode:
      | "study"
      | "break"
  ) {
    // Stop current timer

    setIsRunning(false);

    // Change mode

    setMode(newMode);

    // Set correct time

    if (
      newMode === "study"
    ) {
      setSeconds(
        STUDY_TIME
      );
    } else {
      setSeconds(
        BREAK_TIME
      );
    }
  }

  // =====================================
  // PAGE UI
  // =====================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================================
          NAVBAR
      ================================= */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/dashboard"
            className="text-2xl font-bold text-blue-500"
          >
            StudyPilot AI
          </Link>

          {/* DASHBOARD BUTTON */}

          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* TIMER CARD */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

          {/* TITLE */}

          <h1 className="text-4xl font-bold">
            ⏱️ Pomodoro Timer
          </h1>

          <p className="text-slate-400 mt-3">
            Focus on your studies with timed sessions.
          </p>

          {/* ============================
              STUDY / BREAK BUTTONS
          ============================= */}

          <div className="flex justify-center gap-4 mt-10">

            {/* STUDY BUTTON */}

            <button
              onClick={() =>
                switchMode("study")
              }
              className={`px-6 py-3 rounded-lg ${
                mode === "study"
                  ? "bg-blue-600"
                  : "bg-slate-800"
              }`}
            >
              📚 Study
            </button>

            {/* BREAK BUTTON */}

            <button
              onClick={() =>
                switchMode("break")
              }
              className={`px-6 py-3 rounded-lg ${
                mode === "break"
                  ? "bg-green-600"
                  : "bg-slate-800"
              }`}
            >
              ☕ Break
            </button>

          </div>

          {/* ============================
              TIMER
          ============================= */}

          <div className="mt-12">

            <p className="text-slate-400 text-lg">

              {mode === "study"
                ? "Focus Time"
                : "Break Time"}

            </p>

            {/* BIG TIMER */}

            <div className="text-8xl font-bold mt-4 tracking-wider">

              {formattedTime}

            </div>

          </div>

          {/* ============================
              CONTROL BUTTONS
          ============================= */}

          <div className="flex justify-center gap-4 mt-12">

            {/* START / PAUSE */}

            <button
              onClick={
                toggleTimer
              }
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
            >
              {isRunning
                ? "⏸️ Pause"
                : "▶️ Start"}
            </button>

            {/* RESET */}

            <button
              onClick={
                resetTimer
              }
              className="px-8 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-lg font-semibold"
            >
              🔄 Reset
            </button>

          </div>

          {/* ============================
              COMPLETED SESSIONS
          ============================= */}

          <div className="mt-12 border-t border-slate-800 pt-8">

            <p className="text-slate-400">
              Completed Study Sessions
            </p>

            <p className="text-4xl font-bold mt-2 text-blue-500">
              {completedSessions}
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

