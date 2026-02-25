import { useState, useEffect } from "react";

function Section({ title, tasks, setTasks }) {
  const addTask = () => {
    const text = prompt("Add new item:");
    if (!text) return;
    setTasks([...tasks, { text, completed: false }]);
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {tasks.map((task, index) => (
        <div key={index} style={styles.taskRow}>
          <span
            onClick={() => toggleTask(index)}
            style={{
              ...styles.taskText,
              textDecoration: task.completed ? "line-through" : "none",
              opacity: task.completed ? 0.5 : 1,
            }}
          >
            {task.text}
          </span>
        </div>
      ))}
      <button style={styles.button} onClick={addTask}>
        + Add
      </button>
    </div>
  );
}

export default function App() {
  const [beauty, setBeauty] = useState([]);
  const [vitamins, setVitamins] = useState([]);
  const [meals, setMeals] = useState([]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Daily Glow Routine ✨</h1>

      <Section title="Beauty Routine 💄" tasks={beauty} setTasks={setBeauty} />
      <Section title="Vitamins 💊" tasks={vitamins} setTasks={setVitamins} />
      <Section title="Meals 🥗" tasks={meals} setTasks={setMeals} />
    </div>
  );
}

const styles = {
 container: {
  backgroundColor: "#ffe6f0",
  minHeight: "100vh",
  padding: "20px 15px",
  fontFamily: "'Playfair Display', serif",
  maxWidth: 600,
  margin: "0 auto",
},
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 48,
    textAlign: "center",
    color: "#ff4da6",
  },
  section: {
    background: "white",
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    boxShadow: "0 4px 12px rgba(255, 105, 180, 0.2)",
  },
  sectionTitle: {
    color: "#ff4da6",
  },
  taskRow: {
    marginBottom: 8,
  },
  taskText: {
    cursor: "pointer",
  },
  button: {
    backgroundColor: "#ff99cc",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    color: "white",
  },
};