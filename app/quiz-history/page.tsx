"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type QuizResult = {
  id: number;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
};

export default function QuizHistoryPage() {
  const router = useRouter();

  const [results, setResults] =
    useState<QuizResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadQuizHistory() {
      try {
        setLoading(true);
        setError("");

        // Call Quiz History API
        const response =
          await fetch(
            "/api/quiz/result",
            {
              method: "GET",
              credentials: "include",
            }
          );

        const data =
          await response.json();

        // If user is not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // Handle other errors
        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load quiz history"
          );
        }

        // Save results in state
        setResults(
          data.results || []
        );

      } catch (error) {
        console.error(
          "QUIZ HISTORY ERROR:",
          error
        );

        setError(
          "Unable to load quiz history. Please try again."
        );

      } finally {
        setLoading(false);
      }
    }

    loadQuizHistory();
  }, [router]);

  // Calculate average percentage
  const averagePercentage =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, result) =>
              sum +
              Number(
                result.percentage
              ),
            0
          ) / results.length
        )
      : 0;

  // Find highest score
  const highestPercentage =
    results.length > 0
      ? Math.round(
          Math.max(
            ...results.map(
              (result) =>
                Number(
                  result.percentage
                )
            )
          )
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================================= */}
      {/* NAVBAR */}
      {/* ================================= */}

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
            className="text-slate-300 hover:text-white transition"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            📊 Quiz History
          </h1>

          <p className="text-slate-400 mt-3">
            View your previous quiz attempts
            and track your study progress.
          </p>

        </div>


        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-5">
              ⏳
            </div>

            <h2 className="text-xl font-bold">
              Loading Quiz History...
            </h2>

            <p className="text-slate-400 mt-2">
              Please wait while we fetch
              your quiz results.
            </p>

          </div>

        )}


        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {!loading && error && (

          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-5">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-red-400">
              Something went wrong
            </h2>

            <p className="text-slate-400 mt-3">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Try Again
            </button>

          </div>

        )}


        {/* ================================= */}
        {/* CONTENT AFTER LOADING */}
        {/* ================================= */}

        {!loading &&
          !error && (

            <>

              {/* ================================= */}
              {/* STATISTICS */}
              {/* ================================= */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                {/* TOTAL QUIZZES */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400">
                    Total Quiz Attempts
                  </p>

                  <h2 className="text-4xl font-bold mt-3 text-blue-500">
                    {results.length}
                  </h2>

                </div>


                {/* AVERAGE */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400">
                    Average Score
                  </p>

                  <h2 className="text-4xl font-bold mt-3 text-blue-500">
                    {averagePercentage}%
                  </h2>

                </div>


                {/* BEST */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400">
                    Best Score
                  </p>

                  <h2 className="text-4xl font-bold mt-3 text-blue-500">
                    {highestPercentage}%
                  </h2>

                </div>

              </div>


              {/* ================================= */}
              {/* NO QUIZ RESULTS */}
              {/* ================================= */}

              {results.length === 0 && (

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                  <div className="text-6xl mb-6">
                    🧠
                  </div>

                  <h2 className="text-2xl font-bold">
                    No Quiz Results Yet
                  </h2>

                  <p className="text-slate-400 mt-3">
                    You haven't completed
                    any quizzes yet.
                  </p>

                  <Link
                    href="/quiz"
                    className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    Take Your First Quiz
                  </Link>

                </div>

              )}


              {/* ================================= */}
              {/* QUIZ RESULTS */}
              {/* ================================= */}

              {results.length > 0 && (

                <div>

                  <div className="flex items-center justify-between mb-6">

                    <h2 className="text-2xl font-bold">
                      Your Previous Attempts
                    </h2>

                    <Link
                      href="/quiz"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      Take New Quiz
                    </Link>

                  </div>


                  {/* RESULTS LIST */}

                  <div className="space-y-5">

                    {results.map(
                      (result) => {

                        const percentage =
                          Math.round(
                            Number(
                              result.percentage
                            )
                          );

                        return (

                          <div
                            key={
                              result.id
                            }
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                          >

                            {/* TOP SECTION */}

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                              {/* QUIZ INFORMATION */}

                              <div>

                                <h3 className="text-xl font-bold">
                                  🧠{" "}
                                  {result.subject}
                                </h3>

                                <p className="text-slate-400 mt-2">
                                  Score:{" "}
                                  <span className="text-white font-semibold">
                                    {
                                      result.score
                                    }
                                    {" "}
                                    /{" "}
                                    {
                                      result.total
                                    }
                                  </span>
                                </p>

                                <p className="text-slate-500 text-sm mt-2">
                                  Attempted on:{" "}
                                  {new Date(
                                    result.createdAt
                                  ).toLocaleString()}
                                </p>

                              </div>


                              {/* PERCENTAGE */}

                              <div className="text-center md:text-right">

                                <p className="text-4xl font-bold text-blue-500">
                                  {
                                    percentage
                                  }%
                                </p>

                                <p className="text-slate-400 text-sm mt-1">
                                  Final Score
                                </p>

                              </div>

                            </div>


                            {/* PROGRESS BAR */}

                            <div className="mt-6">

                              <div className="flex justify-between text-sm text-slate-400 mb-2">

                                <span>
                                  Progress
                                </span>

                                <span>
                                  {
                                    percentage
                                  }%
                                </span>

                              </div>

                              <div className="w-full bg-slate-800 rounded-full h-3">

                                <div
                                  className="bg-blue-600 h-3 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        percentage,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              )}

            </>

          )}

      </section>

    </main>
  );
}