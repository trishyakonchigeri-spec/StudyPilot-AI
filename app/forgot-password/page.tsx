"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to process your request."
        );

        return;
      }

      setMessage(
        "Account found. Redirecting..."
      );

      setTimeout(() => {
        router.push(
          `/reset-password?token=${encodeURIComponent(
            data.token
          )}`
        );
      }, 800);

    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <Link
            href="/"
            className="text-3xl font-bold text-blue-500"
          >
            StudyPilot AI
          </Link>

          <h1 className="text-3xl font-bold mt-8">
            Forgot Password?
          </h1>

          <p className="text-slate-400 mt-2">
            Enter your registered email address.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl"
        >

          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
          >
            {loading
              ? "Checking..."
              : "Continue"}
          </button>

          {message && (
            <p className="text-center text-sm mt-4 text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="text-center text-sm mt-4 text-red-400">
              {error}
            </p>
          )}

        </form>

        <p className="text-center text-slate-400 mt-6">

          Remember your password?{" "}

          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Login
          </Link>

        </p>

      </div>

    </main>
  );
}