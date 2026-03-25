export default function DayBox({ day, tasks, onToggle, onDelete, onClick, categories = [] }) {
  const cats = categories.length > 0 ? categories : ["beauty", "vitamins", "exercise", "eating"];
  
  const getLocalDateStr = (date = new Date()) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const tasksByCategory = cats.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat);
    return acc;
  }, {});

  const hasAnyTasks = tasks.length > 0;

  const formatCategory = (cat) => cat.charAt(0).toUpperCase() + cat.slice(1);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isToday = day === today;

  const getDateForDay = (dayName) => {
    const daysMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = daysMap[dayName];
    const todayObj = new Date();
    const currentDay = todayObj.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    const result = new Date(todayObj);
    result.setDate(todayObj.getDate() + diff);
    return getLocalDateStr(result);
  };

  const isCompletedOnDay = (taskId, dayName) => {
    const dateStr = getDateForDay(dayName);
    return localStorage.getItem(`task_completed_${dateStr}_${taskId}`) === 'true';
  };
  
  return (
    <div className="day-box" onClick={onClick}>
      <h3>{day}{isToday && <span className="today-sparkle">✧</span>}</h3>

      {!hasAnyTasks && <p className="empty">No tasks</p>}

      {cats.map(cat => {
        const catTasks = tasksByCategory[cat];
        if (catTasks.length === 0) return null;
        
        return (
          <div key={cat} className="category-section">
            <div className="category-title">{formatCategory(cat)}</div>
            {catTasks.map(task => {
              const isCompleted = isCompletedOnDay(task.id, day);
              return (
              <div key={task.id} className={`task-row ${isCompleted ? "completed" : ""}`}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggle(task.id, isCompleted)}
                  />
                  <span className="task-text">{task.title}</span>
                </label>
                {task.recurrence && (
                  <span className="recurrence-tag">{task.recurrence}</span>
                )}
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            );
            })}
          </div>
        );
      })}
    </div>
  );
}
