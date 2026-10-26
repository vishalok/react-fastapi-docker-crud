import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
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

  useEffect(() => { loadTasks(); }, []);

  async function submitTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const existing = tasks.find((task) => task.id === editingId);
    const url = editingId ? `${API}/tasks/${editingId}` : `${API}/tasks`;
    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { title: title.trim(), completed: existing?.completed ?? false }
      : { title: title.trim() };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      setError("Save failed. Please check the API.");
      return;
    }
    setTitle("");
    setEditingId(null);
    await loadTasks();
  }

  function editTask(task) {
    setEditingId(task.id);
    setTitle(task.title);
  }

  async function toggleTask(task) {
    await fetch(`${API}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title, completed: !task.completed }),
    });
    await loadTasks();
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    await loadTasks();
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">REACT + FASTAPI + DOCKER</p>
        <h1>Task Manager</h1>
        <p className="subtitle">A full-stack CRUD app running in containers.</p>
      </header>

      <form onSubmit={submitTask} className="task-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Learn Docker Compose"
          aria-label="Task title"
          maxLength={200}
        />
        <button type="submit">{editingId ? "Update task" : "Add task"}</button>
        {editingId && (
          <button type="button" className="secondary" onClick={() => {
            setEditingId(null); setTitle("");
          }}>Cancel</button>
        )}
      </form>

      {error && <p className="error">{error}</p>}
      <section className="task-list">
        <div className="list-heading">
          <h2>Your tasks</h2>
          <span>{tasks.length} total</span>
        </div>
        {tasks.length === 0 ? (
          <p className="empty">No tasks yet. Add your first one above.</p>
        ) : tasks.map((task) => (
          <article className="task" key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
              aria-label={`Mark ${task.title} complete`}
            />
            <span className={task.completed ? "completed" : ""}>{task.title}</span>
            <div className="actions">
              <button className="secondary small" onClick={() => editTask(task)}>Edit</button>
              <button className="danger small" onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
      <footer>API docs: <a href={`${API}/docs`} target="_blank" rel="noreferrer">localhost:8000/docs</a></footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
