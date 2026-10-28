"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type QuizResult = {
  documentId: number;
  documentName: string;
  questions: Question[];
  selectedAnswers: Record<number, string>;
};

export default function QuizResultPage() {
  const [result, setResult] =
    useState<QuizResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const documentId =
        window.location.pathname
          .split("/")
          .filter(Boolean)
          .pop();

      if (!documentId) {
        setLoading(false);
        return;
      }

      const stored =
        sessionStorage.getItem(
          `studypilot-result-${documentId}`
        );

      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed =
        JSON.parse(stored) as QuizResult;

      setResult(parsed);
    } catch (error) {
      console.error(
        "Failed to load quiz result:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading results...
        </p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Quiz result not found
          </h1>

          <Link
            href="/dashboard"
            className="inline-block px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const total =
    result.questions.length;

  let score = 0;

  result.questions.forEach(
    (question, index) => {
      const selected =
        result.selectedAnswers[index];

      if (
        selected &&
        selected === question.answer
      ) {
        score++;
      }
    }
  );

  const percentage =
    total > 0
      ? Math.round(
          (score / total) * 100
        )
      : 0;

  let message = "";

  if (percentage >= 90) {
    message = "Excellent work! 🎉";
  } else if (percentage >= 75) {
    message = "Great job! 👍";
  } else if (percentage >= 50) {
    message = "Good effort! Keep practicing.";
  } else {
    message =
      "Keep studying and try again. 💪";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Quiz Results
          </h1>

          <p className="text-slate-400">
            {result.documentName}
          </p>
        </div>

        {/* SCORE */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 text-center">

          <div className="text-6xl font-bold mb-4">
            {score}/{total}
          </div>

          <div className="text-2xl font-semibold mb-2">
            {percentage}%
          </div>

          <p className="text-lg text-slate-300">
            {message}
          </p>

        </div>

        {/* QUESTIONS */}

        <div className="space-y-6">

          {result.questions.map(
            (question, index) => {

              const selected =
                result.selectedAnswers[
                  index
                ];

              const isCorrect =
                selected ===
                question.answer;

              return (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <h2 className="text-xl font-semibold mb-5">
                    {index + 1}.{" "}
                    {question.question}
                  </h2>

                  <div className="space-y-3">

                    {question.options.map(
                      (option, optionIndex) => {

                        const selectedOption =
                          selected === option;

                        const correctOption =
                          question.answer ===
                          option;

                        let className =
                          "w-full text-left p-4 rounded-xl border ";

                        if (correctOption) {
                          className +=
                            "border-green-500 bg-green-500/10 text-green-300";
                        } else if (
                          selectedOption &&
                          !isCorrect
                        ) {
                          className +=
                            "border-red-500 bg-red-500/10 text-red-300";
                        } else {
                          className +=
                            "border-slate-700 bg-slate-950 text-slate-300";
                        }

                        return (
                          <div
                            key={optionIndex}
                            className={className}
                          >
                            {option}
                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* RESULT */}

                  <div
                    className={`mt-5 p-4 rounded-xl ${
                      isCorrect
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}
                  >

                    <p
                      className={`font-semibold ${
                        isCorrect
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct Answer"
                        : "✗ Incorrect Answer"}
                    </p>

                    <p className="text-slate-300 mt-2">
                      Your answer:{" "}
                      <span className="font-medium">
                        {selected ||
                          "Not answered"}
                      </span>
                    </p>

                    <p className="text-slate-300 mt-1">
                      Correct answer:{" "}
                      <span className="font-medium text-green-400">
                        {question.answer}
                      </span>
                    </p>

                    {question.explanation && (
                      <p className="text-slate-400 mt-3">
                        {question.explanation}
                      </p>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* BUTTONS */}

        <div className="flex flex-wrap justify-center gap-4 mt-10">

          <Link
            href={`/dashboard/quiz/${result.documentId}`}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-medium"
          >
            Retake Quiz
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
          >
            Back to Dashboard
          </Link>

        </div>

      </div>
    </main>
  );
}