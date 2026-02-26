export default function DayBox({ day, tasks }) {
  return (
    <div className="day-box">
      <h3>{day}</h3>

      {tasks.length === 0 && <p className="empty">No tasks</p>}

      {tasks.map(task => (
  <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
  <label className="task-label">
    <input
      type="checkbox"
      checked={task.completed}
      onChange={() => toggleTask(task.id, task.completed)}
    />
    <span className="task-text">{task.title}</span>
  </label>
</div>
))}
    </div>
  );
}