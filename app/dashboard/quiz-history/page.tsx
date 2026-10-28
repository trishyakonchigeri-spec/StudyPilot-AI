"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QuizResult = {
  id: number;
  userId: number;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
};

export default function QuizHistoryPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch("/api/quiz-result");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load quiz history."
          );
        }

        setResults(data.results || []);
      } catch (error) {
        console.error("QUIZ HISTORY ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load quiz history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  const averagePercentage =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, result) => sum + result.percentage,
            0
          ) / results.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              Quiz History
            </h1>

            <p className="text-slate-400 mt-2">
              Track your previous quiz attempts and progress.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <p className="text-slate-400">
              Loading quiz history...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <p className="text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        {/* CONTENT */}

        {!loading && !error && (
          <>
            {/* STATISTICS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400">
                  Quizzes Taken
                </p>

                <p className="text-4xl font-bold mt-2">
                  {results.length}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400">
                  Average Score
                </p>

                <p className="text-4xl font-bold mt-2">
                  {averagePercentage}%
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400">
                  Best Score
                </p>

                <p className="text-4xl font-bold mt-2">
                  {results.length > 0
                    ? Math.max(
                        ...results.map(
                          (result) =>
                            result.percentage
                        )
                      )
                    : 0}
                  %
                </p>
              </div>

            </div>

            {/* NO RESULTS */}

            {results.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                <h2 className="text-2xl font-semibold mb-3">
                  No quiz attempts yet
                </h2>

                <p className="text-slate-400 mb-6">
                  Generate and complete your first quiz to see
                  your progress here.
                </p>

                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  Go to Dashboard
                </Link>

              </div>
            )}

            {/* HISTORY */}

            {results.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-2xl font-semibold">
                    Previous Attempts
                  </h2>
                </div>

                <div className="divide-y divide-slate-800">

                  {results.map((result) => {

                    let scoreClass =
                      "text-red-400";

                    if (result.percentage >= 75) {
                      scoreClass =
                        "text-green-400";
                    } else if (
                      result.percentage >= 50
                    ) {
                      scoreClass =
                        "text-yellow-400";
                    }

                    return (
                      <div
                        key={result.id}
                        className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 hover:bg-slate-800/40"
                      >

                        <div>
                          <h3 className="text-xl font-semibold">
                            {result.subject}
                          </h3>

                          <p className="text-slate-500 text-sm mt-1">
                            {new Date(
                              result.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-8">

                          <div>
                            <p className="text-slate-400 text-sm">
                              Score
                            </p>

                            <p className="font-semibold">
                              {result.score}/
                              {result.total}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 text-sm">
                              Percentage
                            </p>

                            <p
                              className={`text-2xl font-bold ${scoreClass}`}
                            >
                              {Math.round(
                                result.percentage
                              )}
                              %
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}