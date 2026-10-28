"use client";

import { useEffect, useState } from "react";

// ==========================================
// TYPES
// ==========================================

type DocumentItem = {
  id: number;
  fileName: string;
  createdAt: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ChatPage() {
  // ========================================
  // DOCUMENT STATE
  // ========================================

  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string>("");

  // ========================================
  // CHAT STATE
  // ========================================

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  // ========================================
  // LOADING STATE
  // ========================================

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [sending, setSending] = useState(false);

  // ========================================
  // ERROR STATE
  // ========================================

  const [error, setError] = useState("");

  // ========================================
  // LOAD DOCUMENTS
  // ========================================

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoadingDocuments(true);
      setError("");

      const response = await fetch("/api/documents");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load documents."
        );
      }

      if (
        data.success &&
        Array.isArray(data.documents)
      ) {
        setDocuments(data.documents);

        // Automatically select first document
        if (data.documents.length > 0) {
          setSelectedDocumentId(
            String(data.documents[0].id)
          );
        }
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error(
        "DOCUMENT LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  }

  // ========================================
  // SEND MESSAGE
  // ========================================

  async function sendMessage() {
    // Do not send empty message
    if (!input.trim()) {
      return;
    }

    // Make sure a document is selected
    if (!selectedDocumentId) {
      setError(
        "Please select a document first."
      );
      return;
    }

    const userMessage = input.trim();

    // Add user message immediately
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    // Clear input
    setInput("");

    // Start loading
    setSending(true);

    // Clear previous error
    setError("");

    try {
      // ======================================
      // CALL RAG CHAT API
      // ======================================

      const response = await fetch(
        "/api/chat-with-document",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            documentId: Number(selectedDocumentId),
            question: userMessage,
          }),
        }
      );

      // ======================================
      // READ RESPONSE ONCE
      // ======================================

      const data = await response.json();

      console.log(
        "CHAT API RESPONSE:",
        data
      );

      // ======================================
      // HANDLE API ERROR
      // ======================================

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to generate AI response."
        );
      }

      // ======================================
      // HANDLE APPLICATION ERROR
      // ======================================

      if (data.success === false) {
        throw new Error(
          data.error ||
            data.message ||
            "AI failed to generate an answer."
        );
      }

      // ======================================
      // GET AI ANSWER
      // ======================================

      const answer =
        data.answer ||
        data.response ||
        data.message;

      if (!answer) {
        throw new Error(
          "The AI API returned no answer."
        );
      }

      // ======================================
      // ADD AI RESPONSE
      // ======================================

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error(
        "CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while chatting with the AI."
      );
    } finally {
      setSending(false);
    }
  }

  // ========================================
  // HANDLE ENTER KEY
  // ========================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  }

  // ========================================
  // CHANGE DOCUMENT
  // ========================================

  function handleDocumentChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const documentId =
      event.target.value;

    setSelectedDocumentId(
      documentId
    );

    // Clear old conversation
    setMessages([]);

    // Clear errors
    setError("");
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            🤖 AI Study Assistant
          </h1>

          <p className="text-slate-400 mt-2">
            Ask questions about your uploaded
            study materials.
          </p>
        </div>

        {/* ================================= */}
        {/* DOCUMENT SELECTOR */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

          <label className="block text-sm font-semibold mb-3">
            📚 Select Study Document
          </label>

          {/* LOADING */}

          {loadingDocuments ? (
            <p className="text-slate-400">
              Loading your documents...
            </p>
          ) : documents.length === 0 ? (

            /* NO DOCUMENTS */

            <div>
              <p className="text-slate-400">
                You have not uploaded any PDFs yet.
              </p>

              <a
                href="/dashboard/upload"
                className="inline-block mt-4 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                📄 Upload PDF
              </a>
            </div>

          ) : (

            /* DOCUMENT LIST */

            <select
              value={selectedDocumentId}
              onChange={handleDocumentChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {documents.map(
                (document) => (
                  <option
                    key={document.id}
                    value={String(document.id)}
                  >
                    {document.fileName}
                  </option>
                )
              )}
            </select>
          )}
        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800 text-red-300 rounded-lg p-4">
            ❌ {error}
          </div>
        )}

        {/* ================================= */}
        {/* CHAT CONTAINER */}
        {/* ================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {/* ================================= */}
          {/* CHAT MESSAGES */}
          {/* ================================= */}

          <div className="min-h-[500px] max-h-[600px] overflow-y-auto p-6 space-y-6">

            {/* EMPTY CHAT */}

            {messages.length === 0 ? (

              <div className="h-[450px] flex flex-col items-center justify-center text-center">

                <div className="text-6xl mb-5">
                  🤖
                </div>

                <h2 className="text-2xl font-bold">
                  Ask Your AI Study Assistant
                </h2>

                <p className="text-slate-400 mt-3 max-w-md">
                  Select one of your uploaded PDFs
                  and ask questions about its content.
                </p>

              </div>

            ) : (

              /* MESSAGES */

              messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[80%] bg-blue-600 rounded-2xl rounded-br-md px-5 py-4"
                          : "max-w-[80%] bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-5 py-4"
                      }
                    >

                      <p className="text-xs font-semibold mb-2 opacity-70">
                        {message.role === "user"
                          ? "You"
                          : "🤖 StudyPilot AI"}
                      </p>

                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>

                    </div>

                  </div>
                )
              )
            )}

            {/* ================================= */}
            {/* AI LOADING */}
            {/* ================================= */}

            {sending && (
              <div className="flex justify-start">

                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4">

                  <p className="text-slate-400">
                    🤖 StudyPilot AI is thinking...
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* ================================= */}
          {/* CHAT INPUT */}
          {/* ================================= */}

          <div className="border-t border-slate-800 p-4">

            <div className="flex gap-3">

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedDocumentId
                    ? "Ask something about your PDF..."
                    : "Select a document first..."
                }
                disabled={
                  sending ||
                  !selectedDocumentId
                }
                rows={2}
                className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={
                  sending ||
                  !input.trim() ||
                  !selectedDocumentId
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-semibold transition"
              >
                {sending
                  ? "Thinking..."
                  : "Send 🚀"}
              </button>

            </div>

            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send.
              Use Shift + Enter for a new line.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}