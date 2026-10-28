"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type DocumentItem = {
  id: number;
  fileName: string;
  createdAt: string;
};

export default function SelectQuizDocumentPage() {
  const router =
    useRouter();

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response =
          await fetch(
            "/api/documents"
          );

        if (
          response.status === 401
        ) {
          router.push(
            "/login"
          );
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

        setDocuments(
          data.documents
        );

      } catch (error) {
        console.error(
          error
        );

        setError(
          "Could not load documents."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-3xl font-bold">
              🧠 Generate Quiz
            </h1>

            <p className="text-slate-400 mt-2">
              Select a PDF to generate your quiz.
            </p>

          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="px-4 py-2 bg-slate-700 rounded-lg"
          >
            Dashboard
          </button>

        </div>

        {loading && (
          <p className="text-slate-400">
            Loading your PDFs...
          </p>
        )}

        {error && (
          <p className="text-red-400">
            ❌ {error}
          </p>
        )}

        {!loading &&
          !error &&
          documents.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <p className="text-4xl">
                📄
              </p>

              <h2 className="text-xl font-bold mt-4">
                No PDFs Found
              </h2>

              <p className="text-slate-400 mt-2">
                Upload a PDF before generating a quiz.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/upload"
                  )
                }
                className="mt-6 px-5 py-3 bg-blue-600 rounded-lg"
              >
                Upload PDF
              </button>

            </div>
          )}

        <div className="grid gap-5">

          {documents.map(
            (document) => (

              <div
                key={document.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between gap-5"
              >

                <div>

                  <p className="text-lg font-semibold">
                    📄{" "}
                    {document.fileName}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Uploaded:{" "}
                    {new Date(
                      document.createdAt
                    ).toLocaleDateString()}
                  </p>

                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/quiz?documentId=${document.id}`
                    )
                  }
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  Generate Quiz
                </button>

              </div>

            )
          )}

        </div>

      </div>

    </main>
  );
}