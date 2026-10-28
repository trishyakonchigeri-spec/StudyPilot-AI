"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // FILE SELECTION
  // ==========================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);

    setMessage("");
    setError("");

    if (!selectedFile) {
      return;
    }

    // Check PDF
    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setFile(null);

      setError(
        "Only PDF files are allowed."
      );

      return;
    }

    // Optional file size limit
    // 10 MB
    const maxSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size >
      maxSize
    ) {
      setFile(null);

      setError(
        "PDF file must be smaller than 10 MB."
      );

      return;
    }
  }

  // ==========================================
  // UPLOAD PDF
  // ==========================================

  async function handleUpload() {
    // Check file
    if (!file) {
      setError(
        "Please select a PDF file."
      );

      return;
    }

    // Check PDF
    if (
      file.type !==
      "application/pdf"
    ) {
      setError(
        "Only PDF files are allowed."
      );

      return;
    }

    setUploading(true);

    setMessage("");
    setError("");

    try {
      // Create FormData
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      // Send to API
      const response =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      // Read response safely
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        const rawResponse =
          await response.text();

        console.error(
          "SERVER RESPONSE:",
          rawResponse
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      const data =
        await response.json();

      // Handle API error
      if (!response.ok) {
        setError(
          data.message ||
            "Failed to upload PDF."
        );

        return;
      }

      // Success
      setMessage(
        "✅ PDF uploaded successfully!"
      );

      // Clear selected file
      setFile(null);

      // Reset input
      const fileInput =
        document.getElementById(
          "pdf-upload"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );

    } finally {
      setUploading(false);
    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}

          <h1 className="text-2xl font-bold text-blue-500">
            StudyPilot AI
          </h1>

          {/* DASHBOARD */}

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="text-slate-300 hover:text-white transition"
          >
            ← Dashboard
          </button>

        </div>

      </nav>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* HEADER */}

          <h1 className="text-3xl font-bold">
            📄 Upload Study PDF
          </h1>

          <p className="text-slate-400 mt-2">
            Upload your study material
            for AI-powered analysis.
          </p>

          {/* FILE INPUT */}

          <div className="mt-8">

            <label
              htmlFor="pdf-upload"
              className="block text-sm font-semibold mb-2"
            >
              Select PDF
            </label>

            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handleFileChange
              }
              disabled={uploading}
              className="w-full p-4 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
            />

          </div>

          {/* SELECTED FILE */}

          {file && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-700 rounded-lg">

              <p className="text-slate-300">
                📄 Selected File:
              </p>

              <p className="text-blue-400 font-semibold mt-1 break-all">
                {file.name}
              </p>

              <p className="text-slate-500 text-sm mt-1">
                Size:{" "}
                {(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB
              </p>

            </div>
          )}

          {/* UPLOAD BUTTON */}

          <button
            onClick={
              handleUpload
            }
            disabled={uploading}
            className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
          >
            {uploading
              ? "Uploading PDF..."
              : "Upload PDF"}
          </button>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="mt-5 p-4 rounded-lg bg-green-900/30 border border-green-700">

              <p className="text-green-400">
                {message}
              </p>

            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mt-5 p-4 rounded-lg bg-red-900/30 border border-red-700">

              <p className="text-red-400">
                ❌ {error}
              </p>

            </div>
          )}

        </div>

        {/* INFO */}

        <div className="mt-6 p-5 bg-slate-900 border border-slate-800 rounded-xl">

          <h2 className="font-semibold">
            💡 What happens after upload?
          </h2>

          <ul className="text-slate-400 text-sm mt-3 space-y-2">

            <li>
              ✓ Your PDF text is extracted.
            </li>

            <li>
              ✓ The document is saved to your account.
            </li>

            <li>
              ✓ Later, StudyPilot AI can use it to generate summaries and quizzes.
            </li>

          </ul>

        </div>

      </div>

    </main>
  );
}