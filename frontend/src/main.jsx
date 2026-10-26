
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch(`${API}/tasks`);
      if (!response.ok) throw new Error("Could not load tasks");

      setTasks(await response.json());
      setError("");
    } catch {
      setError("Cannot reach API. Make sure Docker containers are running.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  async function submitTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    const existing = tasks.find((task) => task.id === editingId);
    const url = editingId
      ? `${API}/tasks/${editingId}`
      : `${API}/tasks`;
    const method = editingId ? "PUT" : "POST";

    const body = {
      title: title.trim(),
      description: description.trim(),
      ...(editingId && {
        completed: existing?.completed ?? false,
      }),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setError("Save failed. Please check the API and schemas.");
        return;
      }

      resetForm();
      await loadTasks();
    } catch {
      setError("Could not save task. Please check the API connection.");
    }
  }

  function editTask(task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setError("");
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description ?? "",
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        setError("Could not update task status.");
        return;
      }

      await loadTasks();
    } catch {
      setError("Could not update task status. Check the API connection.");
    }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    try {
      const response = await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Could not delete task.");
        return;
      }

      if (editingId === id) resetForm();
      await loadTasks();
    } catch {
      setError("Could not delete task. Check the API connection.");
    }
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">REACT + FASTAPI + DOCKER</p>
        <h1>Task Manager</h1>
        <p className="subtitle">
          A full-stack CRUD app running in containers.
        </p>
      </header>

      <form onSubmit={submitTask} className="task-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Learn Docker Compose"
          aria-label="Task title"
          maxLength={200}
          required
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          aria-label="Task description"
          rows={3}
        />

        <button type="submit">
          {editingId ? "Update task" : "Add task"}
        </button>

        {editingId && (
          <button
            type="button"
            className="secondary"
            onClick={resetForm}
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      <section className="task-list">
        <div className="list-heading">
          <h2>Your tasks</h2>
          <span>{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <p className="empty">
            No tasks yet. Add your first one above.
          </p>
        ) : (
          tasks.map((task) => (
            <article className="task" key={task.id}>
              <input
                type="checkbox"
                checked={Boolean(task.completed)}
                onChange={() => toggleTask(task)}
                aria-label={`Mark ${task.title} complete`}
              />
              

              <div className="task-content">
                <span className={task.completed ? "completed" : ""}>
                  {task.title}
                </span>

                {task.description && (
                  <p className="task-description">
                    {task.description}
                  </p>
                )}

                <small>
                  {task.completed ? "Completed" : "Pending"}
                </small>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="secondary small"
                  onClick={() => editTask(task)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="danger small"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <footer>
        API docs:{" "}
        <a href={`${API}/docs`} target="_blank" rel="noreferrer">
          FastAPI /docs
        </a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
