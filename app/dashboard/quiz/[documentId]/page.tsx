"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Quiz = {
  documentId: number;
  documentName: string;
  questions: Question[];
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const documentId = Number(params.documentId);

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // =====================================
  // LOAD QUIZ
  // =====================================

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    try {
      const stored = sessionStorage.getItem(
        `studypilot-quiz-${documentId}`
      );

      if (!stored) {
        console.error("Quiz not found in sessionStorage.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored) as Quiz;

      setQuiz(parsed);
    } catch (error) {
      console.error("Failed to load quiz:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // =====================================
  // SELECT ANSWER
  // =====================================

  function selectAnswer(
    questionIndex: number,
    answer: string
  ) {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
  }

  // =====================================
  // SUBMIT QUIZ
  // =====================================

  async function submitQuiz() {
    console.log("=================================");
    console.log("SUBMIT QUIZ BUTTON CLICKED");

    if (!quiz) {
      console.error("QUIZ IS NULL");
      alert("Quiz not found.");
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      // =====================================
      // CALCULATE SCORE
      // =====================================

      let score = 0;

      quiz.questions.forEach((question, index) => {
        const selectedAnswer =
          selectedAnswers[index];

        if (selectedAnswer === question.answer) {
          score++;
        }
      });

      const total =
        quiz.questions.length;

      const percentage =
        total > 0
          ? Math.round((score / total) * 100)
          : 0;

      console.log("QUIZ SCORE:", score);
      console.log("TOTAL QUESTIONS:", total);
      console.log("PERCENTAGE:", percentage);

      // =====================================
      // PREPARE RESULT DATA
      // =====================================

      const requestBody = {
        subject: quiz.documentName,
        score,
        total,
        percentage,
      };

      console.log(
        "SENDING QUIZ RESULT:",
        requestBody
      );

      // =====================================
      // SAVE RESULT TO DATABASE
      // =====================================

      const response = await fetch(
        "/api/quiz-results",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            requestBody
          ),
        }
      );

      console.log(
        "QUIZ RESULT RESPONSE STATUS:",
        response.status
      );

      const data =
        await response.json();

      console.log(
        "QUIZ RESULT RESPONSE DATA:",
        data
      );

      // =====================================
      // CHECK SAVE RESULT
      // =====================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save quiz result."
        );
      }

      console.log(
        "QUIZ RESULT SAVED SUCCESSFULLY"
      );

      // =====================================
      // SAVE COMPLETE RESULT FOR RESULT PAGE
      // =====================================

      const resultData = {
        documentId:
          quiz.documentId,

        documentName:
          quiz.documentName,

        questions:
          quiz.questions,

        selectedAnswers,
      };

      sessionStorage.setItem(
        `studypilot-result-${documentId}`,
        JSON.stringify(resultData)
      );

      console.log(
        "RESULT SAVED TO SESSION STORAGE"
      );

      // =====================================
      // REDIRECT
      // =====================================

      router.push(
        `/dashboard/quiz/${documentId}/result`
      );

    } catch (error) {
      console.error(
        "SUBMIT QUIZ ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      alert(message);

      setSubmitting(false);
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading quiz...
        </p>
      </main>
    );
  }

  // =====================================
  // QUIZ NOT FOUND
  // =====================================

  if (!quiz) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">

          <h1 className="text-2xl font-bold mb-4">
            Quiz not found
          </h1>

          <p className="text-slate-400 mb-6">
            Generate the quiz again from your PDF.
          </p>

          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>

        </div>
      </main>
    );
  }

  const answeredCount =
    Object.keys(selectedAnswers).length;

  // =====================================
  // PAGE
  // =====================================

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold mb-3">
            Quiz
          </h1>

          <p className="text-slate-400">
            {quiz.documentName}
          </p>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-slate-400">
              {quiz.questions.length} Questions
            </span>

            <span className="text-blue-400 font-medium">
              {answeredCount}/
              {quiz.questions.length} Answered
            </span>

          </div>

        </div>

        {/* QUESTIONS */}

        <div className="space-y-6">

          {quiz.questions.map(
            (question, questionIndex) => {

              const selected =
                selectedAnswers[questionIndex];

              return (
                <div
                  key={questionIndex}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <h2 className="text-xl font-semibold mb-5">
                    {questionIndex + 1}.{" "}
                    {question.question}
                  </h2>

                  <div className="space-y-3">

                    {question.options.map(
                      (option, optionIndex) => {

                        const isSelected =
                          selected === option;

                        return (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                questionIndex,
                                option
                              )
                            }
                            className={`w-full text-left p-4 rounded-xl border transition ${
                              isSelected
                                ? "border-blue-500 bg-blue-500/10 text-blue-300"
                                : "border-slate-700 bg-slate-950 hover:border-blue-500 hover:bg-slate-800"
                            }`}
                          >

                            <span className="mr-3 font-semibold">
                              {String.fromCharCode(
                                65 + optionIndex
                              )}
                              .
                            </span>

                            {option}

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* SUBMIT */}

        <div className="mt-10 mb-10 text-center">

          <button
            type="button"
            onClick={submitQuiz}
            disabled={submitting}
            className="px-10 py-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {submitting
              ? "Saving Result..."
              : "Submit Quiz"}
          </button>

        </div>

      </div>

    </main>
  );
}