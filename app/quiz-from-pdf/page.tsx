"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Document = {
  id: number;
  fileName: string;
};

export default function QuizFromPDFPage() {
  const router = useRouter();

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [selectedDocument, setSelectedDocument] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // LOAD USER DOCUMENTS
  // =====================================

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response =
          await fetch(
            "/api/documents"
          );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to load documents."
          );
          return;
        }

        if (data.success) {
          setDocuments(
            data.documents
          );
        }

      } catch (error) {
        console.error(
          "DOCUMENT LOAD ERROR:",
          error
        );

        setError(
          "Failed to load your PDF documents."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [router]);

  // =====================================
  // GENERATE QUIZ
  // =====================================

  function handleGenerateQuiz() {
    if (!selectedDocument) {
      setError(
        "Please select a PDF document."
      );
      return;
    }

    router.push(
      `/quiz-from-pdf/${selectedDocument}`
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-2xl font-bold text-blue-500">
            StudyPilot AI
          </h1>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="text-slate-300 hover:text-white"
          >
            ← Dashboard
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* HEADER */}

          <h1 className="text-3xl font-bold">
            🧠 Generate Quiz From PDF
          </h1>

          <p className="text-slate-400 mt-2">
            Select one of your uploaded PDF documents
            and generate an AI-powered quiz.
          </p>

          {/* LOADING */}

          {loading && (
            <p className="mt-8 text-slate-400">
              Loading your PDF documents...
            </p>
          )}

          {/* DOCUMENT SELECT */}

          {!loading &&
            documents.length > 0 && (
              <div className="mt-8">

                <label className="block mb-2 font-semibold">
                  Select Study PDF
                </label>

                <select
                  value={selectedDocument}
                  onChange={(e) => {
                    setSelectedDocument(
                      e.target.value
                    );

                    setError("");
                  }}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                >

                  <option value="">
                    -- Select a PDF --
                  </option>

                  {documents.map(
                    (document) => (
                      <option
                        key={document.id}
                        value={document.id}
                      >
                        {document.fileName}
                      </option>
                    )
                  )}

                </select>

                {/* GENERATE BUTTON */}

                <button
                  onClick={
                    handleGenerateQuiz
                  }
                  className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  Generate Quiz
                </button>

              </div>
            )}

          {/* NO DOCUMENTS */}

          {!loading &&
            documents.length === 0 && (
              <div className="mt-8 p-6 rounded-lg bg-slate-950 border border-slate-800">

                <p className="text-slate-300">
                  📄 You have not uploaded
                  any PDF yet.
                </p>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/upload"
                    )
                  }
                  className="mt-5 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  Upload PDF
                </button>

              </div>
            )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-800">

              <p className="text-red-400">
                ❌ {error}
              </p>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}