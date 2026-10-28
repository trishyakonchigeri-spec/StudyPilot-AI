"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

type StudySession = {
  id: number;
  subject: string;
  title: string;
  studyDate: string;
  startTime: string;
  duration: number;
};

export default function StudyPlannerPage() {

  const router = useRouter();

  const [sessions, setSessions] =
    useState<StudySession[]>([]);

  const [subject, setSubject] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [studyDate, setStudyDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [duration, setDuration] =
    useState("60");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================
  // FETCH SESSIONS
  // =====================================

  async function fetchSessions() {

    try {

      const response =
        await fetch(
          "/api/study-sessions"
        );

      if (
        response.status === 401
      ) {
        router.push("/login");
        return;
      }

      const data =
        await response.json();

      if (data.success) {
        setSessions(
          data.sessions
        );
      }

    } catch (error) {

      console.error(error);

      setError(
        "Failed to load study sessions"
      );

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {

    fetchSessions();

  }, []);

  // =====================================
  // CREATE SESSION
  // =====================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setSaving(true);

    setMessage("");

    setError("");

    try {

      const response =
        await fetch(
          "/api/study-sessions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              subject,
              title,
              studyDate,
              startTime,
              duration,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.message ||
            "Failed to create session"
        );

        return;
      }

      setMessage(
        "Study session added successfully!"
      );

      setSubject("");

      setTitle("");

      setStudyDate("");

      setStartTime("");

      setDuration("60");

      fetchSessions();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to server"
      );

    } finally {

      setSaving(false);

    }
  }

  // =====================================
  // DELETE SESSION
  // =====================================

  async function deleteSession(
    id: number
  ) {

    const confirmed =
      window.confirm(
        "Delete this study session?"
      );

    if (!confirmed) {
      return;
    }

    try {

      const response =
        await fetch(
          `/api/study-sessions/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.message ||
            "Failed to delete session"
        );

        return;
      }

      setMessage(
        "Study session deleted!"
      );

      fetchSessions();

    } catch (error) {

      console.error(error);

      setError(
        "Failed to delete session"
      );
    }
  }

  return (

    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            href="/dashboard"
            className="text-2xl font-bold text-blue-500"
          >
            StudyPilot AI
          </Link>

          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            📅 Study Planner
          </h1>

          <p className="text-slate-400 mt-2">
            Plan your study sessions and stay organized.
          </p>

        </div>

        {/* CREATE SESSION */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">
            ➕ Add Study Session
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* SUBJECT */}

            <div>

              <label className="block mb-2">
                Subject
              </label>

              <input
                type="text"
                placeholder="Example: DBMS"
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                required
              />

            </div>

            {/* TITLE */}

            <div>

              <label className="block mb-2">
                Study Topic
              </label>

              <input
                type="text"
                placeholder="Example: Study Normalization"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                required
              />

            </div>

            {/* DATE + TIME */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block mb-2">
                  Study Date
                </label>

                <input
                  type="date"
                  value={studyDate}
                  onChange={(e) =>
                    setStudyDate(
                      e.target.value
                    )
                  }
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                  required
                />

              </div>

              <div>

                <label className="block mb-2">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                  required
                />

              </div>

            </div>

            {/* DURATION */}

            <div>

              <label className="block mb-2">
                Duration
              </label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value
                  )
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
              >

                <option value="25">
                  25 Minutes
                </option>

                <option value="30">
                  30 Minutes
                </option>

                <option value="45">
                  45 Minutes
                </option>

                <option value="60">
                  1 Hour
                </option>

                <option value="90">
                  1.5 Hours
                </option>

                <option value="120">
                  2 Hours
                </option>

              </select>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {saving
                ? "Adding..."
                : "Add Study Session"}
            </button>

          </form>

          {message && (

            <p className="mt-4 text-green-400">
              {message}
            </p>

          )}

          {error && (

            <p className="mt-4 text-red-400">
              {error}
            </p>

          )}

        </div>

        {/* SESSIONS */}

        <h2 className="text-2xl font-bold mb-6">
          Your Study Schedule
        </h2>

        {loading && (

          <p className="text-slate-400">
            Loading schedule...
          </p>

        )}

        {!loading &&
          sessions.length === 0 && (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <p className="text-5xl">
                📅
              </p>

              <h3 className="text-xl font-bold mt-4">
                No study sessions yet
              </h3>

              <p className="text-slate-400 mt-2">
                Add your first study session above.
              </p>

            </div>

          )}

        <div className="space-y-4">

          {sessions.map(
            (session) => (

              <div
                key={session.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-blue-400 font-semibold">
                      {session.subject}
                    </p>

                    <h3 className="text-xl font-bold mt-1">
                      {session.title}
                    </h3>

                    <div className="text-slate-400 mt-3">

                      📅{" "}
                      {new Date(
                        session.studyDate
                      ).toLocaleDateString()}

                      {" • "}

                      ⏰{" "}
                      {session.startTime}

                      {" • "}

                      ⏱️{" "}
                      {session.duration} minutes

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      deleteSession(
                        session.id
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </main>

  );
}