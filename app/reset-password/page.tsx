"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Invalid or missing reset token."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password."
        );
        return;
      }

      setMessage(
        "Password reset successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
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
            Reset Password
          </h1>

          <p className="text-slate-400 mt-2">
            Create a new password for your account.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl"
        >

          <label className="block mb-2">
            New Password
          </label>

          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          <label className="block mt-5 mb-2">
            Confirm New Password
          </label>

          <input
            type="password"
            placeholder="Enter your new password again"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
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
              ? "Resetting Password..."
              : "Reset Password"}
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

      </div>

    </main>
  );
}