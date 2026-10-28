"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

type Task = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================
  // FETCH TASKS
  // =====================================

  async function fetchTasks() {
    try {
      const response =
        await fetch("/api/tasks");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data =
        await response.json();

      if (data.success) {
        setTasks(data.tasks);
      }

    } catch (error) {
      console.error(error);

      setError(
        "Failed to load tasks"
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // =====================================
  // CREATE TASK
  // =====================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);

    setMessage("");

    setError("");

    try {
      const response =
        await fetch("/api/tasks", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            description,
            dueDate,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create task"
        );

        return;
      }

      setMessage(
        "Task created successfully!"
      );

      setTitle("");

      setDescription("");

      setDueDate("");

      fetchTasks();

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to server"
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // TOGGLE TASK
  // =====================================

  async function toggleTask(
    task: Task
  ) {
    try {
      const response =
        await fetch(
          `/api/tasks/${task.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              completed:
                !task.completed,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update task"
        );

        return;
      }

      fetchTasks();

    } catch (error) {
      console.error(error);

      setError(
        "Failed to update task"
      );
    }
  }

  // =====================================
  // DELETE TASK
  // =====================================

  async function deleteTask(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/tasks/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete task"
        );

        return;
      }

      setMessage(
        "Task deleted successfully!"
      );

      fetchTasks();

    } catch (error) {
      console.error(error);

      setError(
        "Failed to delete task"
      );
    }
  }

  // =====================================
  // FILTER TASKS
  // =====================================

  const filteredTasks =
    tasks.filter((task) => {
      if (filter === "completed") {
        return task.completed;
      }

      if (filter === "pending") {
        return !task.completed;
      }

      return true;
    });

  // =====================================
  // COUNTS
  // =====================================

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) => !task.completed
    ).length;

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
            ✅ My Tasks
          </h1>

          <p className="text-slate-400 mt-2">
            Organize your study work and stay productive.
          </p>

        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Total Tasks
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {totalTasks}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Pending
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {pendingTasks}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Completed
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {completedTasks}
            </h2>

          </div>

        </div>

        {/* CREATE TASK */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">
            ➕ Create New Task
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TITLE */}

            <div>

              <label className="block mb-2">
                Task Title
              </label>

              <input
                type="text"
                placeholder="Example: Complete DBMS Assignment"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
                required
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="block mb-2">
                Description
              </label>

              <textarea
                placeholder="Add task details..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500 resize-none"
              />

            </div>

            {/* DUE DATE */}

            <div>

              <label className="block mb-2">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
                className="p-3 rounded-lg bg-slate-950 border border-slate-700 outline-none focus:border-blue-500"
              />

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {saving
                ? "Creating..."
                : "Create Task"}
            </button>

          </form>

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

        {/* FILTER */}

        <div className="flex flex-wrap gap-3 mb-8">

          <button
            onClick={() =>
              setFilter("all")
            }
            className={`px-5 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            All ({totalTasks})
          </button>

          <button
            onClick={() =>
              setFilter("pending")
            }
            className={`px-5 py-2 rounded-lg ${
              filter === "pending"
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            Pending ({pendingTasks})
          </button>

          <button
            onClick={() =>
              setFilter("completed")
            }
            className={`px-5 py-2 rounded-lg ${
              filter === "completed"
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            Completed ({completedTasks})
          </button>

        </div>

        {/* TASK LIST */}

        <h2 className="text-2xl font-bold mb-6">
          Your Tasks
        </h2>

        {loading && (

          <p className="text-slate-400">
            Loading tasks...
          </p>

        )}

        {!loading &&
          filteredTasks.length === 0 && (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <p className="text-5xl">
                ✅
              </p>

              <h3 className="text-xl font-bold mt-4">
                No tasks found
              </h3>

              <p className="text-slate-400 mt-2">
                Create a task to get started.
              </p>

            </div>

          )}

        <div className="space-y-4">

          {filteredTasks.map(
            (task) => (

              <div
                key={task.id}
                className={`bg-slate-900 border rounded-2xl p-6 ${
                  task.completed
                    ? "border-green-800"
                    : "border-slate-800"
                }`}
              >

                <div className="flex items-start gap-4">

                  {/* CHECKBOX */}

                  <input
                    type="checkbox"
                    checked={
                      task.completed
                    }
                    onChange={() =>
                      toggleTask(task)
                    }
                    className="mt-1 w-5 h-5"
                  />

                  {/* TASK CONTENT */}

                  <div className="flex-1">

                    <h3
                      className={`text-xl font-bold ${
                        task.completed
                          ? "line-through text-slate-500"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (

                      <p className="text-slate-400 mt-2 whitespace-pre-wrap">
                        {task.description}
                      </p>

                    )}

                    {task.dueDate && (

                      <p className="text-sm text-slate-500 mt-3">
                        📅 Due:{" "}

                        {new Date(
                          task.dueDate
                        ).toLocaleDateString()}
                      </p>

                    )}

                  </div>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteTask(
                        task.id
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

    </main>
  );
}