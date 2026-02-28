import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";
import DayBox from "./components/DayBox";


export default function App() {
  const [currentPage, setCurrentPage] = useState("daily"); // "daily" or "work"
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(["Beauty", "Vitamins", "Exercise", "Eating"]);
  const [workCategories, setWorkCategories] = useState(["School", "Work", "Personal", "Hobbies"]);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("beauty");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [recurrence, setRecurrence] = useState("none");
  const [selectedDays, setSelectedDays] = useState([]);
  const [day, setDay] = useState("Monday");
  const [expandedDay, setExpandedDay] = useState(null);
  const [taskTime, setTaskTime] = useState("09:00");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [workTaskTime, setWorkTaskTime] = useState("09:00");
  const [workCategory, setWorkCategory] = useState("School");
  const [workRecurrence, setWorkRecurrence] = useState("none");
  const [selectedWorkDays, setSelectedWorkDays] = useState([]);
  const [newWorkTask, setNewWorkTask] = useState("");
  const [dayLogs, setDayLogs] = useState([]);
  const [themeColor, setThemeColor] = useState("#d63384");

  const themes = [
    { name: "Pink", color: "#d63384", bg: "#fff7fb", light: "#ffe4f2", dark: "#ffd6e8", text: "#4a002b" },
    { name: "Blue", color: "#3b82f6", bg: "#f0f9ff", light: "#dbeafe", dark: "#bfdbfe", text: "#1e3a8a" },
    { name: "Green", color: "#22c55e", bg: "#f0fdf4", light: "#dcfce7", dark: "#bbf7d0", text: "#14532d" },
    { name: "Purple", color: "#a855f7", bg: "#faf5ff", light: "#f3e8ff", dark: "#e9d5ff", text: "#581c87" },
    { name: "Orange", color: "#f97316", bg: "#fff7ed", light: "#ffedd5", dark: "#fed7aa", text: "#7c2d12" },
    { name: "Dark", color: "#8b5cf6", bg: "#1e1b4b", light: "#312e81", dark: "#4338ca", text: "#e0e7ff" },
  ];


  useEffect(() => {
    loadTasks();
    loadCategories();
    loadDayLogs();
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

  async function loadDayLogs() {
    const { data } = await supabase
      .from("DayLogs")
      .select("*")
      .order("date", { ascending: false });
    setDayLogs(data || []);
  }

  async function loadCategories() {
    const { data } = await supabase.from("Categories").select("name").order("name");
    if (data && data.length > 0) {
      setCategories(data.map(c => c.name));
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const cat = newCategory.toLowerCase().trim();
    if (categories.includes(cat)) {
      setNewCategory("");
      return;
    }
    
    await supabase.from("Categories").insert([{ name: cat }]);
    setCategories([...categories, cat].sort());
    setNewCategory("");
  }

  async function deleteCategory(cat) {
    await supabase.from("Categories").delete().eq("name", cat);
    setCategories(categories.filter(c => c !== cat));
    if (category === cat) {
      setCategory(categories[0] || "");
    }
  }


  async function addTask() {
  console.log("addTask running");

  if (!newTask.trim()) {
    alert("Please enter a task");
    return;
  }

  const { error } = await supabase.from("Tasks").insert([
  {
    title: newTask,
    category,
    completed: false,
    streak: 0,
    created_at: new Date().toISOString(),
    day: recurrence === "none" ? day : null,
    recurrence: recurrence === "none" ? null : recurrence,
    time: taskTime,
    days:
      recurrence === "daily"
        ? ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        : recurrence === "none"
        ? [day]
        : selectedDays,
  }
]);
  if (error) {
    console.error("Insert error:", error.message);
    alert("Error adding task: " + error.message);
    return;
  }

  setNewTask("");
  loadTasks();
  }


  async function addWorkTask() {
    if (!newWorkTask.trim()) return;

    const { error } = await supabase.from("Tasks").insert([
    {
      title: newWorkTask,
      category: workCategory,
      completed: false,
      streak: 0,
      created_at: new Date().toISOString(),
      page: "work",
      recurrence: workRecurrence === "none" ? null : workRecurrence,
      time: workTaskTime,
      days: workRecurrence === "none" 
        ? [day] 
        : workRecurrence === "daily"
        ? ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        : selectedWorkDays,
    }
  ]);
    if (error) {
      console.error("Insert error:", error.message);
      return;
    }

    setNewWorkTask("");
    loadTasks();
  }




  async function toggleTask(id, completed) {
    const newCompleted = !completed;
    const { error } = await supabase
      .from("Tasks")
      .update({ completed: newCompleted })
      .eq("id", id);

    if (error) {
      console.error("Toggle error:", error.message);
      return;
    }

    if (newCompleted) {
      await checkAndLogCompletedDay();
      loadDayLogs();
    }
    
    loadTasks();
  }

  async function checkAndLogCompletedDay() {
    try {
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = today.toISOString().split('T')[0];
      
      const currentPageTasks = tasks.filter(task => currentPage === "work" ? task.page === "work" : !task.page || task.page === "daily");
      
      const todayTasks = currentPageTasks.filter(t => 
        t.recurrence === "daily" || 
        (Array.isArray(t.days) && t.days.includes(dayName))
      );
      
      const allCompleted = todayTasks.every(t => t.completed);
      
      if (allCompleted && todayTasks.length > 0) {
        const { data: existing } = await supabase
          .from("DayLogs")
          .select("*")
          .eq("date", dateStr)
          .eq("page", currentPage === "work" ? "work" : "daily")
          .maybeSingle();
        
        if (!existing) {
          await supabase.from("DayLogs").insert([{
            date: dateStr,
            page: currentPage === "work" ? "work" : "daily",
            completed: true
          }]);
        }
      }
    } catch (e) {
      console.error("checkAndLogCompletedDay error:", e);
    }
  }

  async function loadDayLogs() {
    try {
      const { data, error } = await supabase
        .from("DayLogs")
        .select("*")
        .order("date", { ascending: false });
      if (error) {
        console.error("DayLogs error:", error.message);
        setDayLogs([]);
      } else {
        setDayLogs(data || []);
      }
    } catch (e) {
      setDayLogs([]);
    }
  }

  const pageLogs = dayLogs.filter(l => currentPage === "work" ? l.page === "work" : !l.page || l.page === "daily");
  
  const getPageTasks = () => {
    return tasks.filter(task => currentPage === "work" ? task.page === "work" : !task.page || task.page === "daily");
  };

  const pageTasks = getPageTasks();
  const pageCategories = currentPage === "daily" ? categories : workCategories;

  const calculateStreak = () => {
    if (pageLogs.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(today);
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasLog = pageLogs.some(l => l.date === dateStr);
      
      if (hasLog) {
        streak++;
      } else if (i === 0) {
        // Today not completed yet, continue checking
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  async function deleteTask(id) {
    const { error } = await supabase
      .from("Tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return;
    }

    loadTasks();
  }


  const currentTheme = themes.find(t => t.color === themeColor) || themes[0];

  return (
    <div className="container" style={{
      "--theme-color": currentTheme.color,
      "--theme-bg": currentTheme.bg,
      "--theme-text": currentTheme.text || "#4a002b",
      "--theme-light": currentTheme.light,
      "--theme-dark": currentTheme.dark,
    }}>
      <div className="header-row">
        <div className="page-switcher">
          <button 
            className={`page-btn ${currentPage === "daily" ? "active" : ""}`}
            onClick={() => setCurrentPage("daily")}
          >
            Glow
          </button>
          <button 
            className={`page-btn ${currentPage === "work" ? "active" : ""}`}
            onClick={() => setCurrentPage("work")}
          >
            Work Glow
          </button>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowCategoryManager(!showCategoryManager)}
          title="Settings"
        >
          ✿
        </button>
      </div>

      <h1 className="title">{currentPage === "daily" ? "Glow ✧" : "Work Glow ✧"}</h1>

      <div className="streak-display">
        <span className="streak-number">{currentStreak}</span>
        <span className="streak-label">day streak</span>
      </div>

      {pageLogs.length > 0 && (
        <div className="completed-days">
          {pageLogs.slice(0, 7).map(log => (
            <span key={log.date} className="completed-day-dot" title={log.date}>
              {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          ))}
        </div>
      )}

      <div className="day-select-wrapper">
        <select 
          className="day-select" 
          value={expandedDay || ""} 
          onChange={(e) => setExpandedDay(e.target.value || null)}
        >
          <option value="">Weekly View</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>

      {currentPage === "daily" ? (
      <div className="add-box">
        <input
          className="input task-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add task..."
        />

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="time-day-row">
          <select
            className="input"
            value={taskTime}
            onChange={(e) => setTaskTime(e.target.value)}
          >
            {Array.from({ length: 48 }, (_, i) => {
              const hours = Math.floor(i / 2);
              const mins = (i % 2) * 30;
              const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              const ampm = hours < 12 ? "AM" : "PM";
              const time24 = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
              return (
                <option key={i} value={time24}>
                  {`${hour12}:${mins.toString().padStart(2, "0")} ${ampm}`}
                </option>
              );
            })}
          </select>

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
        </div>

        <label className="repeat-toggle">
          <input
            type="checkbox"
            checked={recurrence !== "none"}
            onChange={(e) =>
              setRecurrence(e.target.checked ? "daily" : "none")
            }
          />
          Repeat task
        </label>

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
          onClick={() => addTask()}
        >
          Add
        </button>
      </div>
      ) : (
      <div className="add-box">
        <input
          className="input"
          value={newWorkTask}
          onChange={(e) => setNewWorkTask(e.target.value)}
          placeholder="Add task..."
        />

        <select
          className="input"
          value={workCategory}
          onChange={(e) => setWorkCategory(e.target.value)}
        >
          {workCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="time-day-row">
          <select
            className="input"
            value={workTaskTime}
            onChange={(e) => setWorkTaskTime(e.target.value)}
          >
            {Array.from({ length: 48 }, (_, i) => {
              const hours = Math.floor(i / 2);
              const mins = (i % 2) * 30;
              const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              const ampm = hours < 12 ? "AM" : "PM";
              const time24 = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
              return (
                <option key={i} value={time24}>
                  {`${hour12}:${mins.toString().padStart(2, "0")} ${ampm}`}
                </option>
              );
            })}
          </select>

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
        </div>

        <label className="repeat-toggle">
          <input
            type="checkbox"
            checked={workRecurrence !== "none"}
            onChange={(e) =>
              setWorkRecurrence(e.target.checked ? "daily" : "none")
            }
          />
          Repeat task
        </label>

        {workRecurrence !== "none" && (
          <select
            className="input"
            value={workRecurrence}
            onChange={(e) => setWorkRecurrence(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="twice">2x per week</option>
            <option value="thrice">3x per week</option>
          </select>
        )}

        {workRecurrence !== "daily" && workRecurrence !== "none" && (
          <div className="day-checkboxes expanded">
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
              <label key={d} className="day-check">
                <input
                  type="checkbox"
                  checked={selectedWorkDays.includes(d)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedWorkDays([...selectedWorkDays, d]);
                    } else {
                      setSelectedWorkDays(selectedWorkDays.filter(x => x !== d));
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
          onClick={() => addWorkTask()}
        >
          Add
        </button>
      </div>
      )}

      <div className={`settings-panel ${showCategoryManager ? "open" : ""}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-settings" onClick={() => setShowCategoryManager(false)}>×</button>
        </div>
        
        <div className="settings-section">
          <h3>Categories</h3>
          <div className="add-category-row">
            <input
              className="input"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category..."
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <button type="button" className="button small" onClick={addCategory}>Add</button>
          </div>
          <div className="category-list">
            {categories.map(cat => (
              <span key={cat} className="category-chip">
                {cat}
                <button 
                  className="category-delete"
                  onClick={() => deleteCategory(cat)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Theme Color</h3>
          <div className="theme-grid">
            {themes.map(theme => (
              <button
                key={theme.name}
                className={`theme-btn ${themeColor === theme.color ? "active" : ""}`}
                style={{ backgroundColor: theme.bg, borderColor: theme.color }}
                onClick={() => setThemeColor(theme.color)}
              >
                <span style={{ color: theme.color }}>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCategoryManager && <div className="settings-overlay" onClick={() => setShowCategoryManager(false)} />}

      {!expandedDay ? (
        <div className="calendar">
          <DayBox
            day="Monday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Monday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Monday")}
            categories={pageCategories}
          />

          <DayBox
            day="Tuesday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Tuesday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Tuesday")}
            categories={pageCategories}
          />

          <DayBox
            day="Wednesday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Wednesday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Wednesday")}
            categories={pageCategories}
          />

          <DayBox
            day="Thursday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Thursday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Thursday")}
            categories={pageCategories}
          />

          <DayBox
            day="Friday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Friday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Friday")}
            categories={pageCategories}
          />

          <DayBox
            day="Saturday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Saturday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Saturday")}
            categories={pageCategories}
          />

          <DayBox
            day="Sunday"
            tasks={pageTasks.filter(task =>
              (Array.isArray(task.days) && task.days.includes("Sunday")) ||
              task.recurrence === "daily"
            )}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClick={() => setExpandedDay("Sunday")}
            categories={pageCategories}
          />
        </div>
      ) : (
        <div className="day-view">
          {(() => {
            const dayTasks = pageTasks
              .filter(task =>
                (Array.isArray(task.days) && task.days.includes(expandedDay)) ||
                task.recurrence === "daily"
              )
              .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
            
            const getTimeOfDay = (time) => {
              if (!time) return "evening";
              const hour = parseInt(time.split(":")[0]);
              if (hour < 12) return "morning";
              if (hour < 17) return "afternoon";
              return "evening";
            };

            const morningTasks = dayTasks.filter(t => getTimeOfDay(t.time) === "morning");
            const afternoonTasks = dayTasks.filter(t => getTimeOfDay(t.time) === "afternoon");
            const eveningTasks = dayTasks.filter(t => getTimeOfDay(t.time) === "evening");
            
            if (dayTasks.length === 0) {
              return <p className="empty">No tasks for {expandedDay}</p>;
            }

            const renderTasks = (tasks) => tasks.map(task => (
              <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  <span className="task-time">{task.time || "--:--"}</span>
                  <span className={`category-tag ${task.category}`}>
                    {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                  </span>
                  <span className="task-text">{task.title}</span>
                </label>
                {task.recurrence && (
                  <span className="recurrence-tag">{task.recurrence}</span>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  ×
                </button>
              </div>
            ));

            return (
              <div className="day-view">
                {morningTasks.length > 0 && (
                  <div className="time-section">
                    <h4 className="time-header">Morning</h4>
                    {renderTasks(morningTasks)}
                  </div>
                )}
                {afternoonTasks.length > 0 && (
                  <div className="time-section">
                    <h4 className="time-header">Afternoon</h4>
                    {renderTasks(afternoonTasks)}
                  </div>
                )}
                {eveningTasks.length > 0 && (
                  <div className="time-section">
                    <h4 className="time-header">Evening</h4>
                    {renderTasks(eveningTasks)}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
      
    </div>
  );
}
