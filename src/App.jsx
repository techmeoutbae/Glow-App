import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("beauty");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase.from("Glow Table").select("*");

    if (error) {
      console.error("Load error:", error);
      return;
    }

    setTasks(data || []);
  }

  async function addTask() {
  if (!newTask.trim()) return;

  console.log("addTask running");

  const { error } = await supabase.from("Glow Table").insert([
    {
      title: newTask,
      category,
      completed: false,
      streak: 0,
    },
  ]);

  if (error) {
    console.error("Insert error:", error);
    return;
  }

  setNewTask("");
  loadTasks();
}

  async function toggleTask(id, completed) {
    const { error } = await supabase
      .from("Glow Table")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    loadTasks();
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="container">
      <h1 className="title">Daily Glow Routine ✨</h1>

      <div className="add-box">
        <input
          className="input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add task..."
        />

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="beauty">Beauty</option>
          <option value="vitamins">Vitamins</option>
          <option value="exercise">Exercise</option>
          <option value="eating">Eating</option>
        </select>
  <button
    type="button"
    className="button"
    onClick={() => {
      console.log("clicked");
      addTask();
    }}
  >
    Add
  </button>
      </div>

      {/* TO DO SECTION */}
      <div className="section">
        <h2 className="section-title">To Do</h2>

        {activeTasks.length === 0 && <p className="empty">No tasks yet.</p>}

        {activeTasks.map((task) => (
          <div key={task.id} className="task-row">
            <label className="task-label">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
              />
              <span className="task-text">
                {task.title} <span className="category-tag">({task.category})</span>
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* COMPLETED SECTION */}
      <div className="section">
        <h2 className="section-title">Completed 💖</h2>

        {completedTasks.length === 0 && <p className="empty">Nothing completed yet.</p>}

        {completedTasks.map((task) => (
          <div key={task.id} className="task-row completed">
            <label className="task-label">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
              />
              <span className="task-text">
                {task.title} <span className="category-tag">({task.category})</span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}