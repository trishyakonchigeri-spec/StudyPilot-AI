"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ===============================
  // FETCH NOTES
  // ===============================

  async function fetchNotes() {
    try {
      const response =
        await fetch("/api/notes");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
      }

    } catch (error) {
      console.error(error);

      setError("Failed to load notes");

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  // ===============================
  // CREATE / UPDATE NOTE
  // ===============================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = editingId
        ? `/api/notes/${editingId}`
        : "/api/notes";

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Something went wrong"
        );

        return;
      }

      setMessage(
        editingId
          ? "Note updated successfully!"
          : "Note created successfully!"
      );

      setTitle("");
      setContent("");

      setEditingId(null);

      fetchNotes();

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to server"
      );

    } finally {
      setSaving(false);
    }
  }

  // ===============================
  // EDIT NOTE
  // ===============================

  function handleEdit(note: Note) {
    setEditingId(note.id);

    setTitle(note.title);

    setContent(note.content);

    setMessage("");

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ===============================
  // DELETE NOTE
  // ===============================

  async function handleDelete(
    id: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete note"
        );

        return;
      }

      setMessage(
        "Note deleted successfully!"
      );

      fetchNotes();

    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete note"
      );
    }
  }

  // ===============================
  // CANCEL EDIT
  // ===============================

  function cancelEdit() {
    setEditingId(null);

    setTitle("");

    setContent("");

    setMessage("");

    setError("");
  }

  // ===============================
  // SEARCH
  // ===============================

  const filteredNotes =
    notes.filter((note) => {

      const searchText =
        search.toLowerCase();

      return (
        note.title
          .toLowerCase()
          .includes(searchText) ||

        note.content
          .toLowerCase()
          .includes(searchText)
      );

    });

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

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

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            📝 My Notes
          </h1>

          <p className="text-slate-400 mt-2">
            Create and organize your study notes.
          </p>

        </div>

        {/* CREATE NOTE */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">

            {editingId
              ? "✏️ Edit Note"
              : "➕ Create New Note"}

          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TITLE */}

            <div>

              <label className="block mb-2">
                Note Title
              </label>

              <input
                type="text"
                placeholder="Example: DBMS Normalization"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                required
              />

            </div>

            {/* CONTENT */}

            <div>

              <label className="block mb-2">
                Note Content
              </label>

              <textarea
                placeholder="Write your study notes here..."
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                rows={8}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500 resize-none"
                required
              />

            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Note"
                  : "Create Note"}

              </button>

              {editingId && (

                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </button>

              )}

            </div>

          </form>

          {/* MESSAGES */}

          {message && (

            <p className="mt-4 text-green-400">
              {message}
            </p>

          )}

          {error && (

            <p className="mt-4 text-red-400">
              {error}
            </p>

          )}

        </div>

        {/* SEARCH */}

        <div className="mb-8">

          <input
            type="text"
            placeholder="🔍 Search your notes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500"
          />

        </div>

        {/* NOTES */}

        <div>

          <h2 className="text-2xl font-bold mb-6">
            Your Notes ({filteredNotes.length})
          </h2>

          {loading && (

            <p className="text-slate-400">
              Loading notes...
            </p>

          )}

          {!loading &&
            filteredNotes.length === 0 && (

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                <p className="text-5xl">
                  📝
                </p>

                <h3 className="text-xl font-bold mt-4">
                  No notes found
                </h3>

                <p className="text-slate-400 mt-2">
                  Create your first study note above.
                </p>

              </div>

            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {filteredNotes.map(
              (note) => (

                <div
                  key={note.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <h3 className="text-xl font-bold">
                    {note.title}
                  </h3>

                  <p className="text-slate-400 mt-4 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <p className="text-xs text-slate-500 mt-6">
                    Created:{" "}

                    {new Date(
                      note.createdAt
                    ).toLocaleDateString()}
                  </p>

                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() =>
                        handleEdit(note)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          note.id
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}