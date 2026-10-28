"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed"
        );
        return;
      }

      setMessage("Login successful!");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        "Unable to connect to the server"
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
            Welcome Back
          </h1>

          <p className="text-slate-400 mt-2">
            Login to continue your study journey.
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl"
        >

          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          <div className="flex items-center justify-between mt-5 mb-2">

            <label>
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Forgot Password?
            </Link>

          </div>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
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
              ? "Logging in..."
              : "Login"}
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

          Don't have an account?{" "}

          <Link
            href="/signup"
            className="text-blue-400 hover:text-blue-300"
          >
            Create Account
          </Link>

        </p>

      </div>

    </main>
  );
}