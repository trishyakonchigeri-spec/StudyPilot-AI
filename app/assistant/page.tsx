
"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function askAssistant() {
    if (!question.trim()) {
      return;
    }

    const userQuestion =
      question.trim();

    // Add user message

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/assistant",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question:
                userQuestion,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Something went wrong"
        );
      }

      // Add assistant response

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer,
        },
      ]);

    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);

    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      askAssistant();
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

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

      {/* MAIN */}

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold">
            🤖 AI Study Assistant
          </h1>

          <p className="text-slate-400 mt-3">
            Ask questions and get help with your studies.
          </p>

        </div>

        {/* CHAT BOX */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {/* MESSAGES */}

          <div className="min-h-[400px] max-h-[500px] overflow-y-auto p-6 space-y-6">

            {messages.length === 0 && (

              <div className="text-center text-slate-500 py-20">

                <div className="text-5xl mb-4">
                  🤖
                </div>

                <p className="text-lg">
                  Hello! How can I help you study today?
                </p>

                <p className="text-sm mt-2">
                  Try asking: "What is DBMS?"
                </p>

              </div>

            )}

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role ===
                      "user"
                        ? "bg-blue-600"
                        : "bg-slate-800"
                    }`}
                  >

                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>

                  </div>

                </div>

              )
            )}

            {loading && (

              <div className="flex justify-start">

                <div className="bg-slate-800 rounded-2xl px-5 py-3">

                  <p className="text-slate-400">
                    Thinking...
                  </p>

                </div>

              </div>

            )}

          </div>

          {/* INPUT */}

          <div className="border-t border-slate-800 p-4">

            <div className="flex gap-3">

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Ask your study question..."
                rows={2}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
              />

              <button
                onClick={
                  askAssistant
                }
                disabled={
                  loading ||
                  !question.trim()
                }
                className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ask
              </button>

            </div>

            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send • Shift + Enter for a new line
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

