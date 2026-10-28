"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export default function QuizFromPDFPage() {
  const params = useParams();

  const documentId = Number(params.id);

  const [questionCount, setQuestionCount] =
    useState("5");

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [documentName, setDocumentName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, string>>({});

  const [submitted, setSubmitted] =
    useState(false);

  async function generateQuiz() {
    if (
      !documentId ||
      Number.isNaN(documentId)
    ) {
      setError("Invalid document ID.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setSelectedAnswers({});
    setSubmitted(false);

    try {
      const response = await fetch(
        "/api/quiz-from-pdf",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            documentId,
            questionCount:
              Number(questionCount),
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
        data.questions || []
      );

      setDocumentName(
        data.documentName || ""
      );
    } catch (error) {
      console.error(
        "QUIZ ERROR:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(
    questionIndex: number,
    answer: string
  ) {
    if (submitted) {
      return;
    }

    setSelectedAnswers(
      (previous) => ({
        ...previous,
        [questionIndex]:
          answer,
      })
    );
  }

  function calculateScore() {
    let score = 0;

    questions.forEach(
      (question, index) => {
        if (
          selectedAnswers[index] ===
          question.answer
        ) {
          score++;
        }
      }
    );

    return score;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-2xl font-bold text-blue-500">
            StudyPilot AI
          </h1>

          <a
            href="/dashboard"
            className="text-slate-300 hover:text-white"
          >
            ← Dashboard
          </a>

        </div>

      </nav>

      {/* CONTENT */}

      <div className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold">
          🧠 Generate Quiz From PDF
        </h1>

        <p className="text-slate-400 mt-2">
          Create an AI-powered quiz from
          your uploaded study material.
        </p>

        {documentName && (
          <p className="mt-4 text-blue-400">
            📄 {documentName}
          </p>
        )}

        {/* GENERATOR */}

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <label className="block text-slate-300 mb-2">
            Number of Questions
          </label>

          <select
            value={questionCount}
            onChange={(event) =>
              setQuestionCount(
                event.target.value
              )
            }
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700"
          >
            <option value="5">
              5 Questions
            </option>

            <option value="10">
              10 Questions
            </option>

            <option value="15">
              15 Questions
            </option>

            <option value="20">
              20 Questions
            </option>
          </select>

          <button
            onClick={generateQuiz}
            disabled={loading}
            className="mt-5 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading
              ? "Generating Quiz..."
              : "Generate Quiz"}
          </button>

          {loading && (
            <p className="mt-4 text-slate-400">
              Ollama is generating your
              questions. This may take a
              little time...
            </p>
          )}

          {error && (
            <div className="mt-5 p-4 rounded-lg bg-red-900/30 border border-red-800">
              <p className="text-red-400">
                ❌ {error}
              </p>
            </div>
          )}

        </div>

        {/* SCORE */}

        {submitted && (
          <div className="mt-8 bg-blue-900/30 border border-blue-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold">
              🎉 Quiz Result
            </h2>

            <p className="text-xl mt-2">
              Your Score:{" "}
              <span className="font-bold">
                {calculateScore()}
              </span>{" "}
              / {questions.length}
            </p>

          </div>
        )}

        {/* QUESTIONS */}

        {questions.length > 0 && (

          <div className="mt-8 space-y-6">

            {questions.map(
              (question, questionIndex) => (

                <div
                  key={questionIndex}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <h2 className="text-xl font-bold">
                    {questionIndex + 1}.{" "}
                    {question.question}
                  </h2>

                  <div className="mt-5 space-y-3">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => {

                        const isSelected =
                          selectedAnswers[
                            questionIndex
                          ] === option;

                        const isCorrect =
                          option ===
                          question.answer;

                        let className =
                          "w-full text-left p-4 rounded-lg border transition ";

                        if (
                          submitted &&
                          isCorrect
                        ) {
                          className +=
                            "bg-green-900/40 border-green-500";
                        } else if (
                          submitted &&
                          isSelected &&
                          !isCorrect
                        ) {
                          className +=
                            "bg-red-900/40 border-red-500";
                        } else if (
                          isSelected
                        ) {
                          className +=
                            "bg-blue-900/40 border-blue-500";
                        } else {
                          className +=
                            "bg-slate-950 border-slate-700 hover:border-blue-500";
                        }

                        return (
                          <button
                            key={optionIndex}
                            onClick={() =>
                              selectAnswer(
                                questionIndex,
                                option
                              )
                            }
                            disabled={
                              submitted
                            }
                            className={
                              className
                            }
                          >
                            {option}
                          </button>
                        );
                      }
                    )}

                  </div>

                  {submitted && (
                    <div className="mt-5 p-4 bg-slate-950 rounded-lg">

                      <p className="text-green-400 font-semibold">
                        Correct Answer:{" "}
                        {question.answer}
                      </p>

                      {question.explanation && (
                        <p className="text-slate-400 mt-2">
                          {
                            question.explanation
                          }
                        </p>
                      )}

                    </div>
                  )}

                </div>

              )
            )}

            {!submitted && (
              <button
                onClick={() =>
                  setSubmitted(true)
                }
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                Submit Quiz
              </button>
            )}

          </div>

        )}

      </div>

    </main>
  );
}