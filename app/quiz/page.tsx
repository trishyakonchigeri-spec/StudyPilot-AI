"use client";

import {
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export default function QuizPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const documentId =
    searchParams.get(
      "documentId"
    );

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [fileName, setFileName] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [error, setError] =
    useState("");

  // ==========================================
  // GENERATE QUIZ
  // ==========================================

  async function generateQuiz() {
    if (!documentId) {
      setError(
        "No document selected."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/quiz/generate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              documentId:
                Number(documentId),

              numberOfQuestions: 5,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to generate quiz."
        );
        return;
      }

      setQuestions(
        data.questions
      );

      setFileName(
        data.fileName
      );

      setSelectedAnswers(
        new Array(
          data.questions.length
        ).fill(-1)
      );

      setStarted(true);

    } catch (error) {
      console.error(
        "QUIZ ERROR:",
        error
      );

      setError(
        "Could not connect to server."
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // SELECT ANSWER
  // ==========================================

  function selectAnswer(
    answerIndex: number
  ) {
    const updated =
      [...selectedAnswers];

    updated[
      currentQuestion
    ] = answerIndex;

    setSelectedAnswers(
      updated
    );
  }

  // ==========================================
  // FINISH QUIZ
  // ==========================================

  async function finishQuiz() {
    let finalScore = 0;

    questions.forEach(
      (question, index) => {
        if (
          selectedAnswers[index] ===
          question.answer
        ) {
          finalScore++;
        }
      }
    );

    setScore(
      finalScore
    );

    setFinished(true);

    // ==========================================
    // SAVE RESULT
    // ==========================================

    try {
      await fetch(
        "/api/quiz/result",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            subject:
              fileName ||
              "PDF Quiz",

            score:
              finalScore,

            total:
              questions.length,
          }),
        }
      );

    } catch (error) {
      console.error(
        "SAVE RESULT ERROR:",
        error
      );
    }
  }

  // ==========================================
  // NO DOCUMENT
  // ==========================================

  if (!documentId) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            No PDF Selected
          </h1>

          <p className="text-slate-400 mt-3">
            Please select a PDF first.
          </p>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="mt-6 px-5 py-3 bg-blue-600 rounded-lg"
          >
            Back to Dashboard
          </button>

        </div>

      </main>
    );
  }

  // ==========================================
  // FINISHED
  // ==========================================

  if (finished) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

            <h1 className="text-4xl font-bold">
              🎉 Quiz Completed!
            </h1>

            <p className="text-slate-400 mt-4">
              {fileName}
            </p>

            <div className="mt-8">

              <p className="text-6xl font-bold text-blue-500">
                {score}
                /
                {questions.length}
              </p>

              <p className="text-slate-400 mt-3">
                Your Score
              </p>

            </div>

            <div className="flex gap-4 justify-center mt-8">

              <button
                onClick={() =>
                  router.push(
                    "/quiz-history"
                  )
                }
                className="px-5 py-3 bg-blue-600 rounded-lg"
              >
                Quiz History
              </button>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard"
                  )
                }
                className="px-5 py-3 bg-slate-700 rounded-lg"
              >
                Dashboard
              </button>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // BEFORE START
  // ==========================================

  if (!started) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

            <h1 className="text-3xl font-bold">
              🧠 Generate Quiz
            </h1>

            <p className="text-slate-400 mt-3">
              Generate a quiz from your uploaded PDF.
            </p>

            {error && (
              <p className="mt-5 text-red-400">
                ❌ {error}
              </p>
            )}

            <button
              onClick={
                generateQuiz
              }
              disabled={loading}
              className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold"
            >
              {loading
                ? "Generating Quiz..."
                : "Generate Quiz"}
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // QUIZ
  // ==========================================

  const question =
    questions[
      currentQuestion
    ];

  const isLastQuestion =
    currentQuestion ===
    questions.length - 1;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-8">

          <p className="text-blue-400">
            {fileName}
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Question{" "}
            {currentQuestion + 1}
            {" "}
            of{" "}
            {questions.length}
          </h1>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold">
            {question.question}
          </h2>

          <div className="mt-6 space-y-3">

            {question.options.map(
              (
                option,
                index
              ) => (

                <button
                  key={index}
                  onClick={() =>
                    selectAnswer(
                      index
                    )
                  }
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    selectedAnswers[
                      currentQuestion
                    ] === index
                      ? "border-blue-500 bg-blue-600/20"
                      : "border-slate-700 bg-slate-950 hover:border-slate-500"
                  }`}
                >
                  {String.fromCharCode(
                    65 + index
                  )}
                  .{" "}
                  {option}
                </button>

              )
            )}

          </div>

          <div className="flex justify-between mt-8">

            <button
              disabled={
                currentQuestion ===
                0
              }
              onClick={() =>
                setCurrentQuestion(
                  currentQuestion - 1
                )
              }
              className="px-5 py-3 bg-slate-700 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>

            {!isLastQuestion ? (

              <button
                onClick={() =>
                  setCurrentQuestion(
                    currentQuestion + 1
                  )
                }
                className="px-5 py-3 bg-blue-600 rounded-lg"
              >
                Next
              </button>

            ) : (

              <button
                onClick={
                  finishQuiz
                }
                className="px-5 py-3 bg-green-600 rounded-lg"
              >
                Finish Quiz
              </button>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}