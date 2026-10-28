"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ======================================================
// TYPES
// ======================================================

type Document = {
  id: number;
  fileName: string;
  createdAt: string;
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function GenerateQuizPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<number | null>(null);

  // ====================================================
  // LOAD DOCUMENTS
  // ====================================================

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/documents");

        if (!response.ok) {
          throw new Error("Failed to load documents.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load documents."
          );
        }

        if (Array.isArray(data.documents)) {
          setDocuments(data.documents);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error("DOCUMENT LOAD ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load your PDFs."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-5 animate-pulse">
              📚
            </div>

            <h1 className="text-2xl font-bold">
              Loading your PDFs...
            </h1>

            <p className="text-slate-400 mt-2">
              Please wait.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto py-10 px-6">

        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              📚 Select PDF
            </h1>

            <p className="text-slate-400 mt-2">
              Choose a PDF to generate an AI-powered quiz.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            ← Back
          </button>

        </div>

        {/* ============================================ */}
        {/* ERROR */}
        {/* ============================================ */}

        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800 text-red-300 rounded-xl p-4">
            ❌ {error}
          </div>
        )}

        {/* ============================================ */}
        {/* NO DOCUMENTS */}
        {/* ============================================ */}

        {documents.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-6xl mb-5">
              📄
            </div>

            <h2 className="text-2xl font-bold">
              No PDFs Found
            </h2>

            <p className="text-slate-400 mt-3">
              Upload a PDF before generating a quiz.
            </p>

            <button
              onClick={() =>
                router.push("/dashboard/upload")
              }
              className="mt-6 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              📄 Upload PDF
            </button>

          </div>

        ) : (

          /* ========================================== */
          /* DOCUMENT GRID */
          /* ========================================== */

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {documents.map((document) => {

              const isSelected =
                selectedDocumentId === document.id;

              return (
                <div
                  key={document.id}
                  className={`bg-slate-900 border rounded-2xl p-6 transition ${
                    isSelected
                      ? "border-green-500 ring-1 ring-green-500"
                      : "border-slate-800 hover:border-slate-600"
                  }`}
                >

                  {/* PDF ICON */}

                  <div className="text-5xl">
                    📄
                  </div>

                  {/* FILE NAME */}

                  <h2 className="text-xl font-bold mt-4 break-words">
                    {document.fileName}
                  </h2>

                  {/* DATE */}

                  <p className="text-slate-500 mt-2">
                    Uploaded on{" "}
                    {new Date(
                      document.createdAt
                    ).toLocaleDateString()}
                  </p>

                  {/* GENERATE BUTTON */}

                  <button
                    onClick={() => {
                      setSelectedDocumentId(
                        document.id
                      );

                      router.push(
                        `/quiz-from-pdf/${document.id}`
                      );
                    }}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                      isSelected
                        ? "bg-green-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    🧠 Generate Quiz
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}