import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";
import DayBox from "./components/DayBox";


export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("beauty");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [recurrence, setRecurrence] = useState("none");
  const [selectedDays, setSelectedDays] = useState([]);
  const [day, setDay] = useState("Monday");


  useEffect(() => {
    loadTasks();
  }, []);


  async function loadTasks() {
    const { data, error } = await supabase.from("Tasks").select("*");

if (error) {
    console.error("Insert error code:", error.code);
    console.error("Insert error message:", error.message);
    console.error("Insert error details:", error.details);
    console.error("Insert error hint:", error.hint);
    return;
  }


    setTasks(data || []);
  }


 async function addTask() {
  console.log("addTask running");

  if (!newTask.trim()) return;

  const { error } = await supabase.from("Tasks").insert([
  {
    title: newTask,
    category,
    completed: false,
    streak: 0,
    created_at: new Date().toISOString(),
    day: recurrence === "none" ? day : null,
    recurrence: recurrence === "none" ? null : recurrence,
    days:
      recurrence === "daily"
        ? ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        : recurrence === "none"
        ? [day]
        : selectedDays,
    }
]);
    if (error) {
      console.error("Insert error code:", error.code);
      console.error("Insert error message:", error.message);
      console.error("Insert error details:", error.details);
      console.error("Insert error hint:", error.hint);
      return;
    }

    setNewTask("");
    loadTasks();
  }




  async function toggleTask(id, completed) {
  const { error } = await supabase
    .from("Tasks")
    .update({ completed: !completed })
    .eq("id", id);

if (error) {
    console.error("Insert error code:", error.code);
    console.error("Insert error message:", error.message);
    console.error("Insert error details:", error.details);
    console.error("Insert error hint:", error.hint);
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

        {/* Default single day (if recurrence is none) */}
        {recurrence === "none" && (
          <select
            className="input"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        )}

        {/* Repeat toggle */}
        <label>
          <input
            type="checkbox"
            checked={recurrence !== "none"}
            onChange={(e) =>
              setRecurrence(e.target.checked ? "daily" : "none")
            }
          />
          Repeat task
        </label>

        {/* Recurrence dropdown */}
        {recurrence !== "none" && (
          <select
            className="input"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="twice">2x per week</option>
            <option value="thrice">3x per week</option>
          </select>
        )}

        {/* Day checkboxes (only for twice/3x) */}
        {recurrence !== "daily" && recurrence !== "none" && (
          <div className="day-checkboxes expanded">
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
              <label key={d} className="day-check">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(d)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDays([...selectedDays, d]);
                    } else {
                      setSelectedDays(selectedDays.filter(x => x !== d));
                    }
                  }}
                />
                {d}
              </label>
            ))}
          </div>
        )}

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
        <div className="calendar">
          <DayBox
            day="Monday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Monday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Tuesday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Tuesday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Wednesday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Wednesday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Thursday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Thursday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Friday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Friday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Saturday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Saturday")) ||
              task.recurrence === "daily"
            )}
          />

          <DayBox
            day="Sunday"
            tasks={tasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Sunday")) ||
              task.recurrence === "daily"
            )}
          />
        </div>
     
    </div>
  );
}
