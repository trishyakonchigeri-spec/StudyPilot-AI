"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold text-blue-500"
          >
            StudyPilot AI
          </Link>

          <h1 className="text-3xl font-bold mt-8">
            Create your account
          </h1>

          <p className="text-slate-400 mt-2">
            Start your smarter study journey.
          </p>
        </div>

        {/* Signup Form */}

        <form
          onSubmit={handleSignup}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl"
        >

          {/* Name */}

          <label className="block mb-2">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          {/* Email */}

          <label className="block mt-5 mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          {/* Password */}

          <label className="block mt-5 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
            minLength={6}
            required
          />

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          {/* Success */}

          {message && (
            <p className="text-center text-sm mt-4 text-green-400">
              {message}
            </p>
          )}

          {/* Error */}

          {error && (
            <p className="text-center text-sm mt-4 text-red-400">
              {error}
            </p>
          )}

        </form>

        {/* Login Link */}

        <p className="text-center text-slate-400 mt-6">
          Already have an account?{" "}

          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}