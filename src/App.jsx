import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";

const logError = (operation, result) => {
  if (result?.error) {
    console.error(`[${operation}] Error:`, result.error.message, 'Details:', result.error.details, 'Hint:', result.error.hint);
  }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    setError("");
    setMessage("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // Set account start date on signup
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('accountStartDate', today);
        setMessage("Check your email to verify your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1 className="title">Glow ✧</h1>
          <p className="auth-subtitle">Build your identity through habits</p>
          
          <input
            className="input"
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          
          <button className="button" onClick={handleAuth}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          
          <p className="auth-switch" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </p>
        </div>
      </div>
    );
  }

  return <GlowApp session={session} />;
}

function OnboardingWelcome({ onNext, onSkip }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <span className="onboarding-emoji">✨</span>
        <h1 className="onboarding-title">Welcome to Glow</h1>
        <p className="onboarding-subtitle">Build habits through identity</p>
        
        <div className="onboarding-cards">
          <div className="onboarding-card">
            <span className="card-icon">🎯</span>
            <h3>Choose Your Archetype</h3>
            <p>Select an archetype that represents who you want to become - like "Disciplined Creator" or "Healthy Woman"</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">💎</span>
            <h3>Build Your Identity</h3>
            <p>Each habit you complete reinforces the identity you're building. Small actions lead to big transformations.</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">⭐</span>
            <h3>Glow Score</h3>
            <p>Earn points for every habit completed. Your glow score reflects your commitment to becoming your best self.</p>
          </div>
        </div>

        <div className="onboarding-buttons">
          <button className="button primary" onClick={onNext}>
            Get Started
          </button>
          <button className="button text" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingChoose({ archetypes, onSelect, onBack }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="onboarding-emoji">🌟</span>
        <h1 className="onboarding-title">Choose Your Archetype</h1>
        <p className="onboarding-subtitle">Pick the identity that resonates with who you're becoming</p>
        
        <div className="archetypes-grid large">
          {archetypes.map(arch => (
            <div 
              key={arch.id} 
              className="archetype-card large"
              onClick={() => onSelect(arch)}
            >
              <span className="archetype-emoji">{arch.emoji}</span>
              <h3 className="archetype-name">{arch.name}</h3>
              <p className="archetype-preview">{arch.description?.substring(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateEditor({ archetype, habits, onUpdate, onAdd, onRemove, onSave, onBack, isSaving }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content wide">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="onboarding-emoji">{archetype.emoji}</span>
        <h1 className="onboarding-title">Customize Your {archetype.name} Template</h1>
        <p className="onboarding-subtitle">Edit the habits or add your own. Tap to modify.</p>
        
        <div className="template-habits-editor">
          {habits.map((habit, idx) => (
            <div key={idx} className="template-habit-row">
              <input
                className="input"
                placeholder="Habit title"
                name={`habitTitle-${idx}`}
                value={habit.title}
                onChange={(e) => onUpdate(idx, 'title', e.target.value)}
              />
              <input
                className="input two-min"
                placeholder="2-min version"
                name={`habitTwoMin-${idx}`}
                value={habit.twoMin || ''}
                onChange={(e) => onUpdate(idx, 'twoMin', e.target.value)}
              />
              <button className="remove-btn" onClick={() => onRemove(idx)}>×</button>
            </div>
          ))}
          
          <button className="button secondary add-habit-btn" onClick={onAdd}>
            + Add Habit
          </button>
        </div>

        <div className="onboarding-buttons">
          <button className="button primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Start My Glow Journey'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureTooltip({ show, target, onClose }) {
  if (!show) return null;
  
  const tooltips = {
    glowScore: {
      title: 'Your Glow Score',
      content: 'Earn 10 points for each habit completed. Complete all habits for maximum glow!',
      position: 'bottom-right'
    },
    identity: {
      title: 'Your Identity',
      content: 'Each completed habit reinforces your chosen identity. Watch your identity score grow!',
      position: 'top'
    },
    friction: {
      title: 'Friction Check',
      content: 'When you skip a habit, we ask why. This helps you understand your patterns and build self-awareness.',
      position: 'center'
    }
  };
  
  const tooltip = tooltips[target];
  if (!tooltip) return null;
  
  return (
    <div className="tooltip-overlay" onClick={onClose}>
      <div className={`tooltip-box ${tooltip.position}`} onClick={e => e.stopPropagation()}>
        <h4>{tooltip.title}</h4>
        <p>{tooltip.content}</p>
        <button className="tooltip-close" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

function GlowApp({ session }) {
  const [tasks, setTasks] = useState([]);
  const [dayLogs, setDayLogs] = useState([]);
  const [completionLogs, setCompletionLogs] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [archetypes, setArchetypes] = useState([]);
  
  // Main navigation: home, habits, insights, growth, community
  const [currentPage, setCurrentPage] = useState("home");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddIdentity, setShowAddIdentity] = useState(false);
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showFrictionModal, setShowFrictionModal] = useState(false);
  const [frictionTask, setFrictionTask] = useState(null);
  const [frictionReason, setFrictionReason] = useState("");
  const [isAdopting, setIsAdopting] = useState(false);
  const [showGlowAnimation, setShowGlowAnimation] = useState(false);
  
  // Edit habit state
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [templateHabits, setTemplateHabits] = useState([]);
  
  // Check for first-time users and show onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setOnboardingStep('welcome');
    }
  }, []);
  
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipTarget, setTooltipTarget] = useState(null);
  
  // Active archetype profile
  const [activeArchetype, setActiveArchetype] = useState(() => {
    const saved = localStorage.getItem('activeArchetype');
    return saved ? JSON.parse(saved) : null;
  });

  // Show all tasks from all archetypes
  const [showAllTasks, setShowAllTasks] = useState(true);

  // Track which archetypes user has adopted
  const [adoptedArchetypes, setAdoptedArchetypes] = useState(() => {
    const saved = localStorage.getItem('adoptedArchetypes');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Force refresh after task toggle
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Categories
  const defaultCategories = ["Health", "Mindset", "Finances", "Beauty", "Career", "Relationships", "Spirituality"];
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const categoriesList = [...defaultCategories, ...customCategories];
  
  // Form states
  const [newTask, setNewTask] = useState("");
  const [taskCategory, setTaskCategory] = useState(() => defaultCategories[0] || "Health");
  const [taskTime, setTaskTime] = useState("09:00");
  const [taskDay, setTaskDay] = useState("Today");
  const [isAllDay, setIsAllDay] = useState(false);
  const [identityTags, setIdentityTags] = useState([]);
  const [twoMinVersion, setTwoMinVersion] = useState("");
  
  // Identity form
  const [newIdentityName, setNewIdentityName] = useState("");
  const [newIdentityEmoji, setNewIdentityEmoji] = useState("✨");

  const days = ["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Midnight reset for daily habits
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const today = now.toDateString();
      const lastReset = localStorage.getItem('lastResetDate');
      const currentHour = now.getHours();
      
      // Only reset between 12am and 1am to prevent accidental resets
      if (currentHour >= 0 && currentHour < 1 && lastReset !== today) {
        const resetDailyHabits = async () => {
          const { data: tasks } = await supabase.from("tasks").select("id, is_all_day");
          if (tasks) {
            for (const task of tasks) {
              if (!task.is_all_day) {
                await supabase.from("tasks").update({ completed: false }).eq("id", task.id);
              }
            }
          }
          localStorage.setItem('lastResetDate', today);
          loadData();
        };
        resetDailyHabits();
      }
    };
    
    // Check immediately
    checkMidnight();
    
    // Check every minute
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Helper to safely parse days JSON
  const parseDays = (daysValue) => {
    if (!daysValue) return [];
    if (Array.isArray(daysValue)) return daysValue;
    if (typeof daysValue === 'string') {
      try { return JSON.parse(daysValue); } catch (e) { return []; }
    }
    return [];
  };

  // Format time to AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, mins] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${mins || '00'} ${ampm}`;
  };

  // Get time of day category
  const getTimeOfDay = (timeStr) => {
    if (!timeStr) return 'All Day';
    const hours = parseInt(timeStr.split(':')[0], 10);
    if (hours < 12) return 'Morning';
    if (hours < 17) return 'Afternoon';
    return 'Evening';
  };

  // Sort tasks by time
  const sortByTime = (tasks) => {
    return [...tasks].sort((a, b) => {
      if (a.is_all_day && !b.is_all_day) return 1;
      if (!a.is_all_day && b.is_all_day) return -1;
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  };
  
  const defaultIdentities = [
    { id: 'DISCIPLINED', name: 'Disciplined', emoji: '🎯' },
    { id: 'BALANCED', name: 'Balanced', emoji: '⚖️' },
    { id: 'NOURISHED', name: 'Nourished', emoji: '🥗' },
    { id: 'GROUNDED', name: 'Grounded', emoji: '🧘' },
    { id: 'RADIANT', name: 'Radiant', emoji: '✨' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Only auto-show onboarding on initial load, not when switching archetypes
    // Skip if we already have tasks OR if archetypes just loaded
  }, []);

  async function loadData() {
    const userId = session?.user?.id;
    
    try {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      // Filter by user if logged in
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data: tasksData, error: tasksError } = await query;
      
      logError("tasks.select", { error: tasksError });
      setTasks(tasksData || []);
    } catch (e) { 
      console.error("Tasks load error:", e); 
    }

    try {
      const result = await supabase.from("daylogs").select("*").limit(10);
      logError("DayLogs.select", result);
      setDayLogs(result.data || []);
    } catch (e) { /* ignore */ }

    try {
      // Get all completion logs (remove user filter for now)
      const result = await supabase.from("completion_logs").select("*");
      if (!result.error) {
        setCompletionLogs(result.data || []);
      } else {
        console.error("completion_logs error:", result.error);
        setCompletionLogs([]);
      }
    } catch (e) { 
      console.error("completion_logs exception:", e);
      setCompletionLogs([]); 
    }

    try {
      const result = await supabase.from("identities").select("*").limit(10);
      logError("identities.select", result);
      setIdentities(result.data || []);
    } catch (e) { /* ignore */ }

    try {
      const result = await supabase.from("archetypes").select("*");
      logError("archetypes.select", result);
      setArchetypes(result.data || []);
    } catch (e) { /* ignore */ }
  }

  async function adoptArchetype(archetype) {
    setSelectedArchetype(archetype);
    setTemplateHabits(archetype.template_habits || []);
    setShowArchetypeModal(false);
    setOnboardingStep('template');
  }

  async function saveTemplateAndFinish() {
    setIsAdopting(true);
    
    const userId = session?.user?.id;
    if (!userId) return;
    
    // Check if tasks already exist for this archetype
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("archetype_id", selectedArchetype.id)
      .eq("user_id", userId);
    
    if (existingTasks && existingTasks.length > 0) {
      // Tasks already exist, just finish without creating duplicates
      const newAdopted = adoptedArchetypes.find(a => a.id === selectedArchetype.id)
        ? adoptedArchetypes
        : [...adoptedArchetypes, selectedArchetype];
      setAdoptedArchetypes(newAdopted);
      localStorage.setItem('adoptedArchetypes', JSON.stringify(newAdopted));
      localStorage.setItem('hasCompletedOnboarding', 'true');
      setOnboardingStep(null);
      setSelectedArchetype(null);
      setTemplateHabits([]);
      setIsAdopting(false);
      return;
    }
    
    const identityEmojis = {
      'NOURISHED': '🥗',
      'RADIANT': '✨',
      'ENERGIZED': '⚡',
      'BALANCED': '⚖️',
      'FOCUSED': '🎯',
      'CONSISTENT': '🔄',
      'CREATIVE': '💡',
      'DISCIPLINED': '📏',
      'GROUNDED': '🌳',
      'CALM': '🧘',
      'MINDFUL': '🧠',
      'PEACEFUL': '☮️',
      'FINANCIALLY_AWARE': '💰',
      'STRATEGIC': '♟️',
      'ABUNDANT': '🌟',
      'PROSPEROUS': '💎',
      'EXCELLENT': '🏆',
      'DRIVEN': '🚀',
      'ACHIEVER': '🎯',
      'TOP_PERFORMER': '⭐',
      'HARMONIOUS': '🎵',
      'CENTERED': '⚖️',
      'WHOLE': '💫',
      'INTEGRATED': '🔗',
    };

    const createdIdentities = [];
    if (!userId) return;
    
    for (const identityName of selectedArchetype.default_identities) {
      // Check if identity already exists for this user AND archetype
      const { data: existing } = await supabase
        .from("identities")
        .select("*")
        .eq("name", identityName)
        .eq("user_id", userId)
        .eq("archetype_id", selectedArchetype.id)
        .maybeSingle();
      
      if (existing) {
        createdIdentities.push(existing);
      } else {
        const result = await supabase.from("identities").insert({
          name: identityName,
          emoji: identityEmojis[identityName] || '✨',
          user_id: userId,
          archetype_id: selectedArchetype.id,
        }).select().single();
        logError("identities.insert", result);

        if (result.data) {
          createdIdentities.push(result.data);
        }
      }
    }

    // Track adopted archetype
    const newAdopted = [...adoptedArchetypes, selectedArchetype];
    setAdoptedArchetypes(newAdopted);
    localStorage.setItem('adoptedArchetypes', JSON.stringify(newAdopted));

    for (const habit of templateHabits) {
      const category = habit.category || "Growth";
      const page = (category === "Work" || category === "School") ? "work" : "daily";
      const habitTime = habit.time || "09:00";
      const isAllDay = !habit.time;
      const habitDays = habit.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      const result = await supabase.from("tasks").insert({
        title: habit.title,
        category: category,
        page: page,
        user_id: userId,
        streak: 0,
        identity_tags: createdIdentities.map(i => i.id),
        archetype_id: selectedArchetype.id,
        is_all_day: isAllDay,
        time: isAllDay ? null : habitTime,
        days: habitDays,
      });
      logError("tasks.insert", result);
    }

    setOnboardingStep(null);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setSelectedArchetype(null);
    setTemplateHabits([]);
    setIsAdopting(false);
    setIdentities([]);
    await loadData();
  }

  function updateTemplateHabit(index, field, value) {
    const updated = [...templateHabits];
    updated[index] = { ...updated[index], [field]: value };
    setTemplateHabits(updated);
  }

  function addTemplateHabit() {
    setTemplateHabits([...templateHabits, { title: '', twoMin: '' }]);
  }

  function removeTemplateHabit(index) {
    setTemplateHabits(templateHabits.filter((_, i) => i !== index));
  }

  async function addHabit() {
    if (!newTask.trim()) return;
    
    const actualDay = taskDay === "Today" 
      ? new Date().toLocaleDateString('en-US', { weekday: 'long' })
      : taskDay;

    // Determine page based on category
    const page = (taskCategory === "Work" || taskCategory === "School") ? "work" : currentPage;

    try {
      const { error } = await supabase.from("tasks").insert({
        title: newTask,
        category: taskCategory,
        completed: false,
        page: page,
        time: isAllDay ? null : taskTime,
        is_all_day: isAllDay,
        day: actualDay,
        days: [actualDay],
        identity_tags: identityTags,
        archetype_id: activeArchetype?.id || null,
        two_minute_version: twoMinVersion || null,
        user_id: session?.user?.id,
        streak: 0,
      });
      logError("tasks.insert (addHabit)", { error });

      if (!error) {
        setNewTask("");
        setTwoMinVersion("");
        setIdentityTags([]);
        setShowAddHabit(false);
        loadData();
      }
    } catch (e) { console.log("Add habit error:", e); }
  }

  async function toggleTask(id, completed, task = null, date = null) {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const completionKey = `task_completed_${today}_${id}`;
      
      if (completed) {
        localStorage.removeItem(completionKey);
      } else {
        localStorage.setItem(completionKey, 'true');
        setShowGlowAnimation(true);
        // Auto-close after 3 seconds
        setTimeout(() => setShowGlowAnimation(false), 3000);
      }
      
      // Save daily average after toggling
      saveDailyAverage();
      
      // Force re-render to update scores from localStorage
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Toggle task error:', e);
    }
  }

  // Save daily average to localStorage
  function saveDailyAverage() {
    const todayISO = new Date().toISOString().split('T')[0];
    
    // Get used categories
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return 0;
    
    let totalProgress = 0;
    let categoryCount = 0;
    
    for (const category of usedCategories) {
      const categoryTasks = tasks.filter(t => t.category === category);
      if (categoryTasks.length > 0) {
        const completed = categoryTasks.filter(t => 
          localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
        ).length;
        totalProgress += (completed / categoryTasks.length) * 100;
        categoryCount++;
      }
    }
    
    const dailyAverage = categoryCount > 0 ? Math.round(totalProgress / categoryCount) : 0;
    
    // Store today's average
    const history = JSON.parse(localStorage.getItem('progressHistory') || '{}');
    history[todayISO] = dailyAverage;
    localStorage.setItem('progressHistory', JSON.stringify(history));
    
    return dailyAverage;
  }

  // Helper to check if task is completed today (uses localStorage)
  const isCompletedToday = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`task_completed_${today}_${taskId}`) === 'true';
  };

  // Get all completed task IDs for today
  const getCompletedTaskIds = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`task_completed_${today}_`)) {
        const taskId = key.replace(`task_completed_${today}_`, '');
        completed.push(taskId);
      }
    }
    return completed;
  };

  // Handle actual completion after friction
  async function confirmComplete() {
    if (!frictionTask) return;

    for (const identityId of (frictionTask.identity_tags || [])) {
      const result = await supabase.from("completion_logs").insert({
        task_id: frictionTask.id,
        identity_id: identityId,
        user_id: session?.user?.id,
        was_two_minute: true,
      });
      logError("completion_logs.insert", result);
    }

    await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
    setShowGlowAnimation(true);
    loadData();
  }

  async function submitWithReason() {
    if (!frictionTask) return;

    await supabase.from("completion_logs").insert({
      task_id: frictionTask.id,
      identity_id: frictionTask.identity_tags?.[0] || null,
      user_id: session?.user?.id,
      was_two_minute: false,
      friction_reason: frictionReason,
    });

    await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
    setShowGlowAnimation(true);
    loadData();
  }

  async function skipHabit() {
    if (!frictionTask) return;

    await supabase.from("completion_logs").insert({
      task_id: frictionTask.id,
      identity_id: frictionTask.identity_tags?.[0] || null,
      user_id: session?.user?.id,
      was_two_minute: false,
      friction_reason: frictionReason || "skipped",
    });

    await supabase
      .from("tasks")
      .update({ completed: false })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
    loadData();
  }

  async function deleteTask(id) {
    const result = await supabase.from("tasks").delete().eq("id", id);
    logError("tasks.delete", result);
    loadData();
  }

  function openEditHabit(task) {
    setEditingHabit(task);
    setShowEditHabit(true);
  }

  async function saveEditHabit(e) {
    e.preventDefault();
    if (!editingHabit) return;

    const result = await supabase
      .from("tasks")
      .update({
        title: editingHabit.title,
        category: editingHabit.category,
        days: editingHabit.days,
        is_all_day: editingHabit.is_all_day,
      })
      .eq("id", editingHabit.id);
    logError("tasks.update (editHabit)", result);

    setShowEditHabit(false);
    setEditingHabit(null);
    loadData();
  }

  async function addIdentity() {
    if (!newIdentityName.trim()) return;

    const { error } = await supabase.from("identities").insert({
      name: newIdentityName,
      emoji: newIdentityEmoji,
      user_id: session?.user?.id,
      archetype_id: activeArchetype?.id || null,
    });
    logError("identities.insert (addIdentity)", { error });

    if (!error) {
      setNewIdentityName("");
      setNewIdentityEmoji("✨");
      setShowAddIdentity(false);
      loadData();
    }
  }

  async function deleteIdentity(id) {
    const result = await supabase.from("identities").delete().eq("id", id);
    logError("identities.delete", result);
    loadData();
  }

  async function deleteArchetype(archetype) {
    const confirmed = confirm(`Are you sure you want to remove "${archetype.name}"? This will also delete all associated tasks. This cannot be undone.`);
    if (!confirmed) return;
    
    // Delete tasks associated with this archetype
    await supabase.from("tasks").delete().eq("archetype_id", archetype.id);
    
    // Delete identities associated with this archetype
    await supabase.from("identities").delete().eq("archetype_id", archetype.id);
    
    // Remove from adopted archetypes
    const newAdopted = adoptedArchetypes.filter(a => a.id !== archetype.id);
    setAdoptedArchetypes(newAdopted);
    localStorage.setItem('adoptedArchetypes', JSON.stringify(newAdopted));
    
    // Clear active archetype if it was this one
    if (activeArchetype?.id === archetype.id) {
      setActiveArchetype(null);
      localStorage.removeItem('activeArchetype');
    }
    
    loadData();
  }

  async function addUserArchetype() {
    const { error } = await supabase.from("archetypes").insert({
      name: newIdentityName,
      emoji: newIdentityEmoji,
      description: "Custom archetype created by user",
      default_identities: [newIdentityName],
      template_habits: [],
    });
    logError("archetypes.insert (addUserArchetype)", { error });
    
    if (!error) {
      loadData();
    }
  }

  async function switchToArchetype(archetype) {
    const isAlreadyAdopted = adoptedArchetypes.find(a => a.id === archetype.id);
    
    if (isAlreadyAdopted) {
      // Just switch to the adopted archetype
      setActiveArchetype(archetype);
      localStorage.setItem('activeArchetype', JSON.stringify(archetype));
      localStorage.setItem('hasCompletedOnboarding', 'true');
      setOnboardingStep(null);
    } else {
      // New archetype - go to template editor
      setActiveArchetype(archetype);
      localStorage.setItem('activeArchetype', JSON.stringify(archetype));
      setOnboardingStep('template');
      
      // Parse template_habits if it's a string
      let habits = archetype.template_habits;
      if (typeof habits === 'string') {
        try {
          habits = JSON.parse(habits);
        } catch (e) {
          habits = [];
        }
      }
      
      setTemplateHabits(habits || []);
      setSelectedArchetype(archetype);
    }
  }

  async function removeArchetype(archetype) {
    const confirmed = confirm(`Remove "${archetype.name}" from your profiles? This will also delete all associated tasks. This cannot be undone.`);
    if (!confirmed) return;
    
    // Delete tasks associated with this archetype
    await supabase.from("tasks").delete().eq("archetype_id", archetype.id);
    
    // Delete identities associated with this archetype
    await supabase.from("identities").delete().eq("archetype_id", archetype.id);
    
    const newAdopted = adoptedArchetypes.filter(a => a.id !== archetype.id);
    setAdoptedArchetypes(newAdopted);
    localStorage.setItem('adoptedArchetypes', JSON.stringify(newAdopted));
    
    if (activeArchetype?.id === archetype.id) {
      setActiveArchetype(newAdopted[0] || null);
      localStorage.setItem('activeArchetype', JSON.stringify(newAdopted[0] || null));
    }
    
    loadData();
  }

  // Calculate category progress based on localStorage completion
  const getCategoryProgress = (category) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayISO = new Date().toISOString().split('T')[0];
    const categoryTasks = tasks.filter(t => {
      if (t.category !== category) return false;
      const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
      return taskDays?.includes(today) || t.is_all_day;
    });
    if (categoryTasks.length === 0) return 0;
    const completed = categoryTasks.filter(t => 
      localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
    ).length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  const getGlowScore = () => {
    const categories = ["Health", "Mindset", "Finances", "Beauty"];
    const categoryScores = categories.map(cat => getCategoryProgress(cat));
    const validScores = categoryScores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    return Math.round(average);
  };

  // Score based on completed tasks (1 point per task)
  const getIdentityScore = (identityId) => {
    const identity = identities.find(i => i.id === identityId);
    if (!identity) return 0;
    // Use localStorage to check completion status
    const today = new Date().toISOString().split('T')[0];
    const relatedTasks = tasks.filter(t => 
      t.identity_tags && t.identity_tags.includes(identityId)
    );
    return relatedTasks.filter(t => 
      localStorage.getItem(`task_completed_${today}_${t.id}`) === 'true'
    ).length;
  };

  // Get identities based on current view
  const getIdentityOptions = () => {
    // If showAllTasks, show identities from all adopted archetypes
    if (showAllTasks) {
      const adoptedIds = adoptedArchetypes.map(a => a.id);
      const filtered = identities.filter(i => !i.archetype_id || adoptedIds.includes(i.archetype_id));
      return filtered.length > 0 
        ? filtered.map(i => ({ ...i, score: getIdentityScore(i.id) }))
        : defaultIdentities.map(i => ({ ...i, score: 0 }));
    }
    
    // Show only identities for active archetype
    if (activeArchetype) {
      const filtered = identities.filter(i => i.archetype_id === activeArchetype.id);
      return filtered.length > 0 
        ? filtered.map(i => ({ ...i, score: getIdentityScore(i.id) }))
        : defaultIdentities.map(i => ({ ...i, score: 0 }));
    }
    
    // No archetype selected
    return defaultIdentities.map(i => ({ ...i, score: 0 }));
  };

  const identityOptions = getIdentityOptions();

  const getPageTasks = () => {
    let filtered = tasks || [];
    
    // Filter by active archetype unless showAllTasks is enabled
    if (!showAllTasks) {
      // If no archetype selected, show nothing
      if (!activeArchetype) {
        return [];
      }
      filtered = filtered.filter(t => t.archetype_id === activeArchetype.id);
    } else {
      // ShowAllTasks: filter to adopted archetypes only
      const adoptedIds = adoptedArchetypes.map(a => a.id);
      filtered = filtered.filter(t => !t.archetype_id || adoptedIds.includes(t.archetype_id));
    }
    
    return filtered;
  };

  const pageTasks = getPageTasks();
  
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const today = todayName;

  const todayLogs = dayLogs.filter(l => {
    const logDate = new Date(l.date).toDateString();
    return logDate === new Date().toDateString();
  });

  return (
    <div className="container">
      {onboardingStep === 'welcome' && (
        <OnboardingWelcome 
          onNext={() => setOnboardingStep('choose')}
          onSkip={() => {
            localStorage.setItem('hasCompletedOnboarding', 'true');
            setOnboardingStep(null);
          }}
        />
      )}

      {onboardingStep === 'choose' && (
        <OnboardingChoose
          archetypes={archetypes}
          onSelect={(arch) => {
            setSelectedArchetype(arch);
            setTemplateHabits(arch.template_habits || []);
            setOnboardingStep('template');
          }}
          onBack={() => setOnboardingStep('welcome')}
        />
      )}

      {onboardingStep === 'template' && selectedArchetype && (
        <TemplateEditor
          archetype={selectedArchetype}
          habits={templateHabits}
          onUpdate={updateTemplateHabit}
          onAdd={addTemplateHabit}
          onRemove={removeTemplateHabit}
          onSave={saveTemplateAndFinish}
          onBack={() => setOnboardingStep('choose')}
          isSaving={isAdopting}
        />
      )}

      {!onboardingStep && (
        <>
      <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>✿</button>
      
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="close-settings" onClick={() => setShowSettings(false)}>×</button>
          </div>
          
          <div className="settings-section">
            <h3>My Archetypes</h3>
            <p className="settings-hint">Switch between your adopted archetypes</p>
            <div className="archetype-switcher">
              {adoptedArchetypes.length > 0 ? (
                adoptedArchetypes.map(arch => (
                  <div
                    key={arch.id}
                    className={`archetype-switch-btn ${activeArchetype?.id === arch.id ? 'active' : ''}`}
                    onClick={() => switchToArchetype(arch)}
                  >
                    {arch.emoji} {arch.name}
                    <button 
                      className="remove-archetype-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeArchetype(arch);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-archetypes">No archetypes adopted yet</p>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3>Add Archetype</h3>
            <p className="settings-hint">Choose from available archetypes</p>
            <div className="archetype-switcher">
              {archetypes
                .filter(arch => !adoptedArchetypes.find(a => a.id === arch.id))
                .map(arch => (
                  <div
                    key={arch.id}
                    className="archetype-switch-btn"
                    onClick={() => switchToArchetype(arch)}
                  >
                    {arch.emoji} {arch.name}
                  </div>
                ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Add New Archetype</h3>
            <p className="settings-hint">Create your own custom archetype</p>
            <input
              className="input"
              placeholder="Archetype name"
              name="archetypeName"
              value={newIdentityName}
              onChange={(e) => setNewIdentityName(e.target.value)}
            />
            <select
              className="input"
              name="archetypeEmoji"
              value={newIdentityEmoji}
              onChange={(e) => setNewIdentityEmoji(e.target.value)}
            >
              <option value="✨">✨</option>
              <option value="💎">💎</option>
              <option value="🌟">🌟</option>
              <option value="🔥">🔥</option>
              <option value="💪">💪</option>
              <option value="🧘">🧘</option>
              <option value="⚡">⚡</option>
              <option value="🌸">🌸</option>
              <option value="💰">💰</option>
              <option value="🎯">🎯</option>
            </select>
            <button className="button" onClick={addUserArchetype}>Create Archetype</button>
          </div>

          <div className="settings-section">
            <h3>My Identities</h3>
            <p className="settings-hint">All your identity traits across archetypes</p>
            <div className="identity-list">
              {identities.length > 0 ? (
                identities.map(id => (
                  <div key={id.id} className="identity-list-item">
                    <span>{id.emoji} {id.name}</span>
                    <span className="identity-score">{getIdentityScore(id.id) || 0} pts</span>
                  </div>
                ))
              ) : (
                <p className="empty-message">No identities yet. Adopt an archetype to build your identities.</p>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3>Help</h3>
            <button className="help-btn" onClick={() => setShowHowItWorks(true)}>
              How Glow Works
            </button>
            <button className="help-btn" onClick={() => setOnboardingStep('welcome')}>
              Replay Introduction
            </button>
          </div>

          <div className="settings-section">
            <button className="button logout-btn" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal how-it-works-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How Glow Works</h2>
              <button onClick={() => setShowHowItWorks(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="how-it-works-content">
                <div className="how-item">
                  <span className="how-icon">🎯</span>
                  <h4>Choose Your Archetype</h4>
                  <p>Select an archetype that represents who you want to become - like "Disciplined Creator" or "Healthy Woman"</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">💎</span>
                  <h4>Build Your Identity</h4>
                  <p>Each habit you complete reinforces the identity you're building. Small actions lead to big transformations.</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">✨</span>
                  <h4>Two-Minute Version</h4>
                  <p>Every habit has a 2-minute version. On tough days, do just the minimum to keep your streak alive.</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">⭐</span>
                  <h4>Glow Score</h4>
                  <p>Earn 10 points for each habit completed. Your glow score reflects your commitment to becoming your best self.</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">🔄</span>
                  <h4>Friction Check</h4>
                  <p>When you skip a habit, we ask why. This helps you understand your patterns and build self-awareness.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${currentPage === "home" ? "active" : ""}`}
          onClick={() => setCurrentPage("home")}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === "habits" ? "active" : ""}`}
          onClick={() => setCurrentPage("habits")}
        >
          <span className="nav-icon">✓</span>
          <span className="nav-label">Habits</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === "insights" ? "active" : ""}`}
          onClick={() => setCurrentPage("insights")}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Insights</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === "growth" ? "active" : ""}`}
          onClick={() => setCurrentPage("growth")}
        >
          <span className="nav-icon">🌱</span>
          <span className="nav-label">Growth</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === "community" ? "active" : ""}`}
          onClick={() => setCurrentPage("community")}
        >
          <span className="nav-icon">💜</span>
          <span className="nav-label">Community</span>
        </button>
      </nav>

      {/* Glow Animation Overlay */}
      {showGlowAnimation && (
        <div className="glow-overlay" onClick={() => setShowGlowAnimation(false)}>
          <div className="sparkles"></div>
          <button className="glow-close-btn" onClick={(e) => { e.stopPropagation(); setShowGlowAnimation(false); }}>×</button>
          <div className="glow-burst">✨</div>
          <div className="glow-message">You're on a glow ✨</div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {showEditHabit && editingHabit && (
        <div className="modal-overlay" onClick={() => setShowEditHabit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Habit</h2>
              <button onClick={() => setShowEditHabit(false)}>×</button>
            </div>
            <form onSubmit={saveEditHabit}>
              <div className="modal-content">
                <label className="form-label">Habit Title</label>
                <input
                  className="input"
                  type="text"
                  value={editingHabit.title}
                  onChange={(e) => setEditingHabit({...editingHabit, title: e.target.value})}
                  required
                />
                
                <label className="form-label">Category</label>
                <select
                  className="input"
                  value={editingHabit.category || 'Health'}
                  onChange={(e) => setEditingHabit({...editingHabit, category: e.target.value})}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <label className="form-label">Days</label>
                <div className="days-checkboxes">
                  {days.filter(d => d !== "Today").map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={(typeof editingHabit.days === 'string' ? JSON.parse(editingHabit.days) : editingHabit.days)?.includes(day)}
                        onChange={(e) => {
                          const currentDays = typeof editingHabit.days === 'string' ? JSON.parse(editingHabit.days) : (editingHabit.days || []);
                          const newDays = e.target.checked 
                            ? [...currentDays, day]
                            : currentDays.filter(d => d !== day);
                          setEditingHabit({...editingHabit, days: newDays});
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
                
                <label className="form-label checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingHabit.is_all_day || false}
                    onChange={(e) => setEditingHabit({...editingHabit, is_all_day: e.target.checked})}
                  />
                  Show every day
                </label>
                
                <button type="submit" className="button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Content */}
      {currentPage === "home" && (
        <HomePage 
          tasks={tasks}
          activeArchetype={activeArchetype}
          identities={identities}
          completionLogs={completionLogs}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={openEditHabit}
          categoriesList={categoriesList}
          refreshKey={refreshKey}
        />
      )}

      {currentPage === "habits" && (
        <HabitsPage 
          tasks={tasks}
          adoptedArchetypes={adoptedArchetypes}
          activeArchetype={activeArchetype}
          setActiveArchetype={setActiveArchetype}
          showAddHabit={showAddHabit}
          setShowAddHabit={setShowAddHabit}
          onAddHabit={addHabit}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={openEditHabit}
          categoriesList={categoriesList}
          days={days}
          identityOptions={identityOptions}
          setExpandedDay={setExpandedDay}
          expandedDay={expandedDay}
          pageTasks={pageTasks}
          showAllTasks={showAllTasks}
          setShowAllTasks={setShowAllTasks}
          refreshKey={refreshKey}
        />
      )}

      {currentPage === "insights" && (
        <InsightsPage 
          tasks={tasks}
          completionLogs={completionLogs}
          categoriesList={categoriesList}
          days={days}
          refreshKey={refreshKey}
        />
      )}

      {currentPage === "growth" && (
        <GrowthPage 
          identities={identities}
          tasks={tasks}
          completionLogs={completionLogs}
          categoriesList={categoriesList}
        />
      )}

      {currentPage === "community" && (
        <CommunityPage session={session} />
      )}
        </>
      )}
      </div>
  );
}

// Home Page Component
function HomePage({ tasks, activeArchetype, identities, completionLogs, onToggleTask, onDeleteTask, onEditTask, categoriesList = ["Health", "Mindset", "Finances", "Beauty"], refreshKey }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  const getCompletedTaskIds = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`task_completed_${today}_`)) {
        const taskId = key.replace(`task_completed_${today}_`, '');
        completed.add(taskId);
      }
    }
    return completed;
  };
  
  const completedIds = getCompletedTaskIds();
  
  const todayTasks = tasks.filter(t => {
    if (!t.archetype_id) return true;
    const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
    return taskDays?.includes(today) || t.is_all_day;
  });

  // Calculate category progress (today only)
  const getCategoryProgress = (category) => {
    const categoryTasks = todayTasks.filter(t => t.category === category);
    if (categoryTasks.length === 0) return 0;
    const completed = categoryTasks.filter(t => completedIds.has(t.id)).length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  // Get categories that have tasks
  const getUsedCategories = () => {
    const usedCategories = new Set(tasks.map(t => t.category).filter(Boolean));
    return categoriesList.filter(c => usedCategories.has(c));
  };

  // Glow score is average of ALL used categories (including 0s)
  const glowScore = () => {
    const usedCategories = getUsedCategories();
    if (usedCategories.length === 0) return 0;
    const progress = usedCategories.map(c => getCategoryProgress(c));
    return Math.round(progress.reduce((a, b) => a + b, 0) / progress.length);
  };

  // Calculate weekly average - average of ALL habits for current week (Mon-Sun)
  const getWeeklyAverage = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    // Calculate average for each day of the week (Mon-Sun)
    let totalProgress = 0;
    let daysWithTasks = 0;
    
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return 0;
    
    // Loop through each day of the week
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      
      // Skip future days
      if (dayDate > today) continue;
      
      const dayStr = dayDate.toISOString().split('T')[0];
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get tasks for this day
      const dayTasks = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
          return taskDays?.includes(dayName);
        }
        return true;
      });
      
      if (dayTasks.length === 0) continue;
      
      // Calculate completion for this day
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      totalProgress += (completed / dayTasks.length) * 100;
      daysWithTasks++;
    }
    
    return daysWithTasks > 0 ? Math.round(totalProgress / daysWithTasks) : 0;
  };

  // Calculate all-time average - average of ALL days from signup to now
  const getCumulativeAverage = () => {
    const accountStartDate = localStorage.getItem('accountStartDate');
    if (!accountStartDate) return 0;
    
    const startDate = new Date(accountStartDate);
    const today = new Date();
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return 0;
    
    let totalProgress = 0;
    let daysWithTasks = 0;
    
    // Loop through every day from signup to today
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get tasks for this day
      const dayTasks = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
          return taskDays?.includes(dayName);
        }
        return true;
      });
      
      if (dayTasks.length === 0) continue;
      
      // Calculate completion for this day
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      totalProgress += (completed / dayTasks.length) * 100;
      daysWithTasks++;
    }
    
    return daysWithTasks > 0 ? Math.round(totalProgress / daysWithTasks) : 0;
  };

  // Calculate streak - only counts if ALL daily habits are completed
  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get tasks for this specific day
      const tasksForDay = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
          return taskDays?.includes(dayName);
        }
        return true;
      });
      
      // If no tasks for this day, skip
      if (tasksForDay.length === 0) continue;
      
      // Check if ALL tasks are completed
      let allCompleted = true;
      for (const task of tasksForDay) {
        const completed = localStorage.getItem(`task_completed_${dateStr}_${task.id}`) === 'true';
        if (!completed) {
          allCompleted = false;
          break;
        }
      }
      
      // Don't count today if it's still ongoing (no streak yet)
      const isToday = i === 0;
      const now = new Date();
      const isAfter8PM = now.getHours() >= 20;
      
      if (allCompleted && (!isToday || isAfter8PM)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();
  const streakLabel = streak >= 30 ? "Full Glow" : streak >= 10 ? "Aura" : streak >= 3 ? "Sparkle" : "";
  const dailyAvg = glowScore();
  const weeklyAvg = getWeeklyAverage();
  const overallAvg = getCumulativeAverage();

  return (
    <div className="home-page">
      <h1 className="title">Glow ✧</h1>
      
      <div className="home-section glow-score-section">
        <h2>Today's Glow</h2>
        <div className="glow-progress-bar-container">
          <div className="glow-progress-bar" style={{ width: `${dailyAvg}%` }}>
            <span className="glow-sparkles">✧ ✦ ✧</span>
          </div>
        </div>
        <span className="glow-percentage">{dailyAvg}%</span>
      </div>

      <div className="home-section streak-section">
        <h2>Weekly Glow</h2>
        <div className="glow-progress-bar-container">
          <div className="glow-progress-bar weekly" style={{ width: `${weeklyAvg}%` }}>
            <span className="glow-sparkles">✧ ✦ ✧</span>
          </div>
        </div>
        <span className="glow-percentage">{weeklyAvg}%</span>
      </div>

      <div className="home-section glow-score-section">
        <h2>Glow Streak</h2>
        <div className="glow-progress-bar-container">
          <div className="glow-progress-bar streak" style={{ width: `${Math.min(streak * 10, 100)}%` }}>
            <span className="glow-sparkles">🔥</span>
          </div>
        </div>
        <div className="streak-info">
          <span className="glow-percentage">{streak || 0} days</span>
          {streak === 0 && (
            <span className="streak-hint">Complete all daily habits to get a Glow Streak</span>
          )}
          {streakLabel && <span className="streak-badge">{streakLabel}</span>}
        </div>
      </div>

      <div className="home-section glow-score-section">
        <h2>Glow Score</h2>
        <div className="glow-score-display">
          <span className="glow-score-value large light">{overallAvg}% ✧</span>
          <span className="streak-label">all time average</span>
        </div>
      </div>

      <div className="home-section todays-habits-section">
        <h2>Today's Habits</h2>
        {todayTasks.length === 0 ? (
          <p className="empty-message">No habits for today</p>
        ) : (
          <div className="habits-list">
            {(() => {
              // Group tasks by category
              const groupedTasks = {};
              categoriesList.forEach(cat => {
                groupedTasks[cat] = todayTasks.filter(t => t.category === cat);
              });
              // Add tasks without a category or with unknown category
              groupedTasks['Other'] = todayTasks.filter(t => !t.category || !categoriesList.includes(t.category));
              
              return Object.entries(groupedTasks).map(([category, taskList]) => {
                if (taskList.length === 0) return null;
                return (
                  <div key={category} className="category-group">
                    <h3 className="category-title">{category}</h3>
                    {taskList.map(task => {
                      const isDone = completedIds.has(task.id);
                      return (
                      <div key={task.id} className={`habit-item ${isDone ? 'completed' : ''}`}>
                        <div 
                          className="habit-checkbox"
                          onClick={() => onToggleTask(task.id, isDone, task)}
                        >
                          <span className="checkbox-emoji">{isDone ? '✓' : '○'}</span>
                          <span className="habit-text">{task.title}</span>
                        </div>
                        <div className="habit-actions">
                          <button className="edit-btn" onClick={() => onEditTask(task)}>✎</button>
                          <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>×</button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}


// Habits Page Component  
function HabitsPage({ tasks, adoptedArchetypes, activeArchetype, setActiveArchetype, showAddHabit, setShowAddHabit, onAddHabit, onToggleTask, onDeleteTask, onEditTask, categoriesList, days, identityOptions, setExpandedDay, expandedDay, pageTasks, showAllTasks, setShowAllTasks, refreshKey }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toDateString();

  const getDateForDay = (dayName) => {
    const daysMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = daysMap[dayName];
    const todayObj = new Date();
    const currentDay = todayObj.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    const result = new Date(todayObj);
    result.setDate(todayObj.getDate() + diff);
    return result.toISOString().split('T')[0];
  };

  const isCompletedOnDay = (taskId, dayName) => {
    const dateStr = getDateForDay(dayName);
    return localStorage.getItem(`task_completed_${dateStr}_${taskId}`) === 'true';
  };

  return (
    <div className="habits-page">
      <h1 className="title">Habits ✧</h1>
      
      {/* Archetype Selector with View All option */}
      {adoptedArchetypes.length > 0 && (
        <div className="archetype-selector">
          <div
            className={`archetype-chip ${showAllTasks ? 'active' : ''}`}
            onClick={() => {
              setShowAllTasks(true);
              setActiveArchetype(null);
            }}
          >
            ✨ View All
          </div>
          {adoptedArchetypes.map(arch => (
            <div
              key={arch.id}
              className={`archetype-chip ${activeArchetype?.id === arch.id && !showAllTasks ? 'active' : ''}`}
              onClick={() => {
                setShowAllTasks(false);
                setActiveArchetype(arch);
              }}
            >
              {arch.emoji} {arch.name}
            </div>
          ))}
        </div>
      )}

      {/* Day Selector */}
      <div className="day-selector">
        <select 
          className="day-select"
          value={expandedDay || ""}
          onChange={(e) => setExpandedDay(e.target.value || null)}
        >
          <option value="">Weekly View</option>
          {days.filter(d => d !== "Today").map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button className="add-btn" onClick={() => setShowAddHabit(true)}>+ Add</button>
      </div>

      {/* Weekly/Daily View */}
      {!expandedDay ? (
        <div className="calendar">
          {days.filter(d => d !== "Today").map(day => {
            const dayTasks = pageTasks.filter(t => {
              const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
              return t.is_all_day || !taskDays || taskDays.includes(day);
            });
            if (dayTasks.length === 0) return null;
            
            const isToday = day === today;
            const displayTasks = dayTasks.slice(0, 5);
            const hasMore = dayTasks.length > 5;
            
            return (
              <div key={day} className={`day-box ${isToday ? 'today' : ''}`} onClick={() => setExpandedDay(day)}>
                {isToday && <span className="sparkle-icon">✨</span>}
                <h3>{day}</h3>
                <p className="day-progress">{dayTasks.filter(t => isCompletedOnDay(t.id, day)).length}/{dayTasks.length}</p>
                <div className="day-tasks-preview">
                  {displayTasks.map(task => (
                    <div key={task.id} className={`task-preview ${isCompletedOnDay(task.id, day) ? 'completed' : ''}`}>
                      {task.title}
                    </div>
                  ))}
                  {hasMore && <div className="more-tasks">+{dayTasks.length - 5} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="day-view">
          <button className="back-btn" onClick={() => setExpandedDay(null)}>← Back</button>
          <h2>{expandedDay} {expandedDay === today && <span className="sparkle-icon">✨</span>}</h2>
          {(() => {
            const dayTasks = pageTasks.filter(t => {
              const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
              return t.is_all_day || !taskDays || taskDays.includes(expandedDay);
            });
            
            if (!dayTasks.length) return <p className="empty">No habits</p>;
            
            // Group tasks by category
            const groupedTasks = {};
            categoriesList.forEach(cat => {
              groupedTasks[cat] = dayTasks.filter(t => t.category === cat);
            });
            // Add any tasks without a category
            groupedTasks['Other'] = dayTasks.filter(t => !t.category || !categoriesList.includes(t.category));
            
            return (
              <div className="tasks-by-category">
                {Object.entries(groupedTasks).map(([category, tasks]) => {
                  if (tasks.length === 0) return null;
                  return (
                    <div key={category} className="category-group">
                      <h3 className="category-title">{category}</h3>
                      {tasks.map(task => {
                          const isCompleted = isCompletedOnDay(task.id, expandedDay);
                          return (
                        <div key={task.id} className={`task-row ${isCompleted ? 'completed' : ''}`}>
                          <label className="task-label">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => onToggleTask(task.id, isCompleted, task, getDateForDay(expandedDay))}
                            />
                            <span className="task-text">{task.title}</span>
                          </label>
                          <div className="task-actions">
                            <button className="edit-btn" onClick={() => onEditTask(task)}>✎</button>
                            <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>×</button>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddHabit && (
        <AddHabitModal 
          onClose={() => setShowAddHabit(false)}
          onAdd={onAddHabit}
          categories={categoriesList}
          days={days}
          identityOptions={identityOptions}
          onAddCategory={(name) => {
            if (!customCategories.includes(name) && !defaultCategories.includes(name)) {
              const updated = [...customCategories, name];
              setCustomCategories(updated);
              localStorage.setItem('customCategories', JSON.stringify(updated));
            }
          }}
        />
      )}
    </div>
  );
}

// Add Habit Modal
function AddHabitModal({ onClose, onAdd, categories, days, identityOptions, onAddCategory }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [time, setTime] = useState("09:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title, category, time, isAllDay);
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && onAddCategory) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
      setShowNewCategory(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Habit</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <input
            className="input"
            placeholder="Habit title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="category-select-wrapper">
            <select 
              className="input"
              value={category}
              onChange={e => {
                if (e.target.value === "__new__") {
                  setShowNewCategory(true);
                  setCategory(categories[0]);
                } else {
                  setCategory(e.target.value);
                }
              }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">+ Add New Category</option>
            </select>
          </div>
          {showNewCategory && (
            <div className="new-category-input">
              <input
                className="input"
                placeholder="New category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button className="button small" onClick={handleAddCategory}>Add</button>
            </div>
          )}
          <label className="checkbox-label">
            <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />
            All Day
          </label>
          {!isAllDay && (
            <input
              type="time"
              className="input"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          )}
          <button className="button" onClick={handleSubmit}>Add Habit</button>
        </div>
      </div>
    </div>
  );
}

// Insights Page Component
function InsightsPage({ tasks, completionLogs, categoriesList, days, refreshKey }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get or set account creation date
  const getAccountStartDate = () => {
    let startDate = localStorage.getItem('accountStartDate');
    if (!startDate) {
      startDate = new Date().toISOString().split('T')[0];
      localStorage.setItem('accountStartDate', startDate);
    }
    return startDate;
  };

  // Save daily average to localStorage
  const saveDailyAverage = () => {
    const todayISO = new Date().toISOString().split('T')[0];
    const dailyLogKey = `daily_average_${todayISO}`;
    
    // Calculate today's glow score
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return;
    
    let totalProgress = 0;
    let categoryCount = 0;
    
    for (const category of usedCategories) {
      const categoryTasks = tasks.filter(t => t.category === category);
      if (categoryTasks.length > 0) {
        const completed = categoryTasks.filter(t => 
          localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
        ).length;
        totalProgress += (completed / categoryTasks.length) * 100;
        categoryCount++;
      }
    }
    
    const dailyAverage = categoryCount > 0 ? Math.round(totalProgress / categoryCount) : 0;
    
    // Store today's average
    const history = JSON.parse(localStorage.getItem('progressHistory') || '{}');
    history[todayISO] = dailyAverage;
    localStorage.setItem('progressHistory', JSON.stringify(history));
    
    return dailyAverage;
  };

  // Calculate cumulative average - average of ALL days from signup to now
  const getCumulativeAverage = () => {
    const accountStartDate = localStorage.getItem('accountStartDate');
    if (!accountStartDate) return 0;
    
    const startDate = new Date(accountStartDate);
    const today = new Date();
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return 0;
    
    let totalProgress = 0;
    let daysWithTasks = 0;
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayTasks = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
          return taskDays?.includes(dayName);
        }
        return true;
      });
      
      if (dayTasks.length === 0) continue;
      
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      totalProgress += (completed / dayTasks.length) * 100;
      daysWithTasks++;
    }
    
    return daysWithTasks > 0 ? Math.round(totalProgress / daysWithTasks) : 0;
  };

  // Calculate weekly average - average of ALL habits for current week
  const getWeeklyAverage = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    let totalProgress = 0;
    let daysWithTasks = 0;
    
    const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    if (usedCategories.length === 0) return 0;
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      
      if (dayDate > today) continue;
      
      const dayStr = dayDate.toISOString().split('T')[0];
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayTasks = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
          return taskDays?.includes(dayName);
        }
        return true;
      });
      
      if (dayTasks.length === 0) continue;
      
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      totalProgress += (completed / dayTasks.length) * 100;
      daysWithTasks++;
    }
    
    return daysWithTasks > 0 ? Math.round(totalProgress / daysWithTasks) : 0;
  };

  // Calculate monthly average (last 30 days)
  const getMonthlyAverage = () => {
    const history = JSON.parse(localStorage.getItem('progressHistory') || '{}');
    const today = new Date();
    let total = 0;
    let count = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (history[dateStr] !== undefined) {
        total += history[dateStr];
        count++;
      }
    }
    
    return count > 0 ? Math.round(total / count) : 0;
  };

  // Save today's average when page loads
  useEffect(() => {
    saveDailyAverage();
  }, [tasks]);

  // Calculate category progress for today (0-100)
  const getCategoryProgress = (category) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const categoryTasks = tasks.filter(t => {
      if (t.category !== category) return false;
      const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
      return taskDays?.includes(today) || t.is_all_day;
    });
    if (categoryTasks.length === 0) return 0;
    const completed = categoryTasks.filter(t => 
      localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
    ).length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  // Get used categories
  const getUsedCategories = () => {
    const usedCategories = new Set(tasks.map(t => t.category).filter(Boolean));
    return categoriesList.filter(c => usedCategories.has(c));
  };

  // Glow score is average of ALL used categories (including 0s)
  const glowScore = () => {
    const usedCategories = getUsedCategories();
    if (usedCategories.length === 0) return 0;
    const progress = usedCategories.map(c => getCategoryProgress(c));
    return Math.round(progress.reduce((a, b) => a + b, 0) / progress.length);
  };

  // Get time period for category view
  const [categoryTimePeriod, setCategoryTimePeriod] = useState('today');

  // Get category progress based on time period
  const getCategoryProgressByPeriod = (category, period) => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const history = JSON.parse(localStorage.getItem('progressHistory') || '{}');
    
    const categoryTasks = tasks.filter(t => t.category === category);
    if (categoryTasks.length === 0) return 0;
    
    if (period === 'today') {
      const completed = categoryTasks.filter(t => 
        localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
      ).length;
      return Math.round((completed / categoryTasks.length) * 100);
    }
    
    // For week/month/all - average of stored daily category averages
    let total = 0;
    let count = 0;
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const categoryKey = `category_${category}_${dateStr}`;
      if (history[categoryKey] !== undefined) {
        total += history[categoryKey];
        count++;
      }
    }
    
    return count > 0 ? Math.round(total / count) : 0;
  };

  // Save daily average and category averages when toggling
  useEffect(() => {
    const saveCategoryAverages = () => {
      const todayISO = new Date().toISOString().split('T')[0];
      const usedCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
      if (usedCategories.length === 0) return;
      
      const history = JSON.parse(localStorage.getItem('progressHistory') || '{}');
      
      for (const category of usedCategories) {
        const categoryTasks = tasks.filter(t => t.category === category);
        if (categoryTasks.length > 0) {
          const completed = categoryTasks.filter(t => 
            localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
          ).length;
          const categoryAvg = Math.round((completed / categoryTasks.length) * 100);
          history[`category_${category}_${todayISO}`] = categoryAvg;
        }
      }
      
      localStorage.setItem('progressHistory', JSON.stringify(history));
    };
    
    saveCategoryAverages();
  }, [tasks, refreshKey]);

  const cumulativeAvg = getCumulativeAverage();
  const weeklyAvg = getWeeklyAverage();
  const monthlyAvg = getMonthlyAverage();

  return (
    <div className="insights-page">
      <h1 className="title">Insights ✧</h1>
      
      <div className="insights-section">
        <h2>Average Progress</h2>
        <div className="averages-grid">
          <div className="average-card">
            <span className="average-label">Today</span>
            <span className="average-value">{cumulativeAvg > 0 ? cumulativeAvg : glowScore()}%</span>
          </div>
          <div className="average-card">
            <span className="average-label">Week</span>
            <span className="average-value">{weeklyAvg}%</span>
          </div>
          <div className="average-card">
            <span className="average-label">Month</span>
            <span className="average-value">{monthlyAvg}%</span>
          </div>
          <div className="average-card">
            <span className="average-label">All Time</span>
            <span className="average-value">{cumulativeAvg}%</span>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h2>Today's Progress</h2>
        <div className="glow-score-display">
          <span className="glow-score-value large">{glowScore()} ✧</span>
        </div>
      </div>

      <div className="insights-section">
        <div className="category-time-selector">
          <span 
            className={`time-chip ${categoryTimePeriod === 'today' ? 'active' : ''}`}
            onClick={() => setCategoryTimePeriod('today')}
          >Today</span>
          <span 
            className={`time-chip ${categoryTimePeriod === 'week' ? 'active' : ''}`}
            onClick={() => setCategoryTimePeriod('week')}
          >Week</span>
          <span 
            className={`time-chip ${categoryTimePeriod === 'month' ? 'active' : ''}`}
            onClick={() => setCategoryTimePeriod('month')}
          >Month</span>
          <span 
            className={`time-chip ${categoryTimePeriod === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryTimePeriod('all')}
          >All Time</span>
        </div>
        <h2>Category Progress</h2>
        {categoriesList.map(cat => {
          const progress = getCategoryProgressByPeriod(cat, categoryTimePeriod);
          return (
          <div key={cat} className="category-progress">
            <div className="category-header">
              <span>{cat}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// Growth Page Component
function GrowthPage({ identities, tasks, completionLogs, categoriesList }) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('longTermGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Health', timeframe: '3m' });
  
  const timeframes = [
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
  ];
  
  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    const goal = {
      ...newGoal,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      progress: 0,
    };
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem('longTermGoals', JSON.stringify(updatedGoals));
    setNewGoal({ title: '', category: 'Health', timeframe: '3m' });
    setShowAddGoal(false);
  };
  
  const deleteGoal = (id) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem('longTermGoals', JSON.stringify(updatedGoals));
  };
  
  // Calculate identity progress scores
  const getIdentityProgress = (identityId) => {
    const logs = completionLogs.filter(l => l.identity_id === identityId);
    return logs.length;
  };
  
  return (
    <div className="growth-page">
      <h1 className="title">Growth ✧</h1>
      
      <div className="growth-section">
        <div className="section-header">
          <h2>Long-term Goals</h2>
          <button className="add-btn" onClick={() => setShowAddGoal(!showAddGoal)}>
            {showAddGoal ? '×' : '+'}
          </button>
        </div>
        
        {showAddGoal && (
          <form onSubmit={addGoal} className="goal-form">
            <input
              className="input"
              type="text"
              placeholder="Goal title..."
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            />
            <select
              className="input"
              value={newGoal.category}
              onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="input"
              value={newGoal.timeframe}
              onChange={(e) => setNewGoal({...newGoal, timeframe: e.target.value})}
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
            <button type="submit" className="button">Add Goal</button>
          </form>
        )}
        
        {goals.length === 0 ? (
          <p className="empty-message">No long-term goals yet. Add one to start tracking your growth!</p>
        ) : (
          <div className="goals-list">
            {goals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-info">
                  <span className="goal-title">{goal.title}</span>
                  <div className="goal-meta">
                    <span className="goal-category">{goal.category}</span>
                    <span className="goal-timeframe">
                      {timeframes.find(tf => tf.value === goal.timeframe)?.label}
                    </span>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteGoal(goal.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="growth-section">
        <h2>Identity Development</h2>
        <p className="section-hint">Your growth across identity traits</p>
        
        {identities.length === 0 ? (
          <p className="empty-message">No identities yet. Adopt an archetype to build your identities.</p>
        ) : (
          <div className="identities-progress">
            {identities.map(id => {
              const progress = getIdentityProgress(id.id);
              return (
                <div key={id.id} className="identity-progress-item">
                  <div className="identity-info">
                    <span className="identity-emoji">{id.emoji}</span>
                    <span className="identity-name">{id.name}</span>
                  </div>
                  <div className="identity-score-display">
                    <span className="score-number">{progress}</span>
                    <span className="score-label">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Community Page Component
function CommunityPage({ session }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showJoinChallenge, setShowJoinChallenge] = useState(null);

  useEffect(() => {
    loadFriends();
    loadChallenges();
    loadLeaderboard();
  }, []);

  async function loadFriends() {
    if (!session?.user?.id) return;
    
    // Load friends (accepted)
    const { data: friendsData } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
      .eq('status', 'accepted');
    
    // Get friend details
    if (friendsData?.length) {
      const friendIds = friendsData.map(f => 
        f.user_id === session.user.id ? f.friend_id : f.user_id
      );
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', friendIds);
      setFriends(profiles || []);
    }
    
    // Load pending requests
    const { data: requests } = await supabase
      .from('friends')
      .select('*')
      .eq('friend_id', session.user.id)
      .eq('status', 'pending');
    
    if (requests?.length) {
      const requesterIds = requests.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', requesterIds);
      setFriendRequests(profiles || []);
    }
  }

  async function loadChallenges() {
    const { data: allChallenges } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Get participant counts and friend participants for each challenge
    const challengesWithParticipants = await Promise.all((allChallenges || []).map(async (challenge) => {
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challenge.id);
      
      const { data: friendParticipants } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challenge.id)
        .in('user_id', friends.map(f => f.id));
      
      return {
        ...challenge,
        totalParticipants: participants?.length || 0,
        friendParticipants: friendParticipants?.length || 0
      };
    }));
    
    setChallenges(challengesWithParticipants || []);
    
    if (session?.user?.id) {
      const { data: userParticipants } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', session.user.id);
      setJoinedChallenges(userParticipants || []);
    }
  }

  async function loadLeaderboard() {
    const { data: streaks } = await supabase
      .from('community_streaks')
      .select('*')
      .order('streak_count', { ascending: false })
      .limit(10);
    
    if (streaks?.length) {
      const userIds = streaks.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds);
      
      const merged = streaks.map(s => ({
        ...s,
        profile: profiles?.find(p => p.id === s.user_id)
      }));
      setLeaderboard(merged);
    }
  }

  async function sendFriendRequest() {
    if (!friendEmail.trim() || !session?.user?.id) return;
    
    // Find user by email (would need user_profiles table)
    alert('Friend request sent! (Requires email lookup setup)');
    setFriendEmail('');
  }

  async function acceptFriendRequest(requesterId) {
    if (!session?.user?.id) return;
    
    await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('friend_id', session.user.id)
      .eq('user_id', requesterId);
    
    loadFriends();
  }

  async function joinChallenge(challengeId) {
    if (!session?.user?.id) return;
    
    await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      user_id: session.user.id
    });
    
    loadChallenges();
  }

  return (
    <div className="community-page">
      <h1 className="title">Glow Community ✧</h1>
      
      <div className="community-tabs">
        <span 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >Friends</span>
        <span 
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >Challenges</span>
        <span 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >Leaderboard</span>
      </div>

      {activeTab === 'friends' && (
        <div className="community-section">
          <h2>Add Friend</h2>
          <div className="add-friend-form">
            <input
              className="input"
              type="email"
              placeholder="Enter friend's email..."
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
            />
            <button className="button" onClick={sendFriendRequest}>Send Request</button>
          </div>
          
          {friendRequests.length > 0 && (
            <div className="friend-requests">
              <h3>Friend Requests</h3>
              {friendRequests.map(req => (
                <div key={req.id} className="friend-request-item">
                  <span>{req.email || 'New request'}</span>
                  <button className="button small" onClick={() => acceptFriendRequest(req.id)}>Accept</button>
                </div>
              ))}
            </div>
          )}
          
          <h2>Your Friends</h2>
          {friends.length === 0 ? (
            <p className="empty-message">No friends yet. Add someone to get started!</p>
          ) : (
            <div className="friends-list">
              {friends.map(friend => (
                <div key={friend.id} className="friend-item">
                  <span className="friend-avatar">{friend.emoji || '👤'}</span>
                  <span className="friend-name">{friend.name || 'Friend'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="challenges-section">
          {/* My Joined Challenges */}
          {joinedChallenges.length > 0 && (
            <div className="my-challenges">
              <h2>✨ My Challenges</h2>
              <div className="my-challenges-grid">
                {joinedChallenges.map(join => {
                  const challenge = challenges.find(c => c.id === join.challenge_id);
                  if (!challenge) return null;
                  const challengeEmojis = {
                    '30-Day Glow Up': '✨🌟✨',
                    '7-Day Glow': '✨',
                    'Hydration Goddess': '💧',
                    'Fitness Glow': '💪',
                    'Mindful Mornings': '🧘',
                    'Financial Glow': '💰'
                  };
                  return (
                    <div key={join.id} className="my-challenge-card">
                      <div className="challenge-icon">{challengeEmojis[challenge.title] || '🎯'}</div>
                      <h3>{challenge.title}</h3>
                      <div className="challenge-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill glow-progress" 
                            style={{ width: `${join.progress || 0}%` }}
                          />
                        </div>
                        <span>{join.progress || 0}%</span>
                      </div>
                      <span className="days-left">{challenge.duration_days - Math.floor((Date.now() - new Date(join.joined_at).getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* All Challenges - hide already joined */}
          <h2>🔥 Active Challenges</h2>
          {challenges.filter(c => !joinedChallenges.some(j => j.challenge_id === c.id)).length === 0 ? (
            <p className="empty-message">You've joined all challenges! Check back for new ones.</p>
          ) : (
            <div className="challenges-grid">
              {challenges.filter(c => !joinedChallenges.some(j => j.challenge_id === c.id)).map(challenge => {
                const isJoined = joinedChallenges.some(j => j.challenge_id === challenge.id);
                const challengeEmojis = {
                  '30-Day Glow Up': '✨🌟✨',
                  '7-Day Glow': '✨',
                  'Hydration Goddess': '💧',
                  'Fitness Glow': '💪',
                  'Mindful Mornings': '🧘',
                  'Financial Glow': '💰'
                };
                return (
                  <div key={challenge.id} className={`challenge-card ${isJoined ? 'joined' : ''}`}>
                    <div className="challenge-header">
                      <span className="challenge-emoji">{challengeEmojis[challenge.title] || '🌟'}</span>
                      <span className="challenge-category">{challenge.category}</span>
                    </div>
                    <h3>{challenge.title}</h3>
                    <p className="challenge-desc">{challenge.description}</p>
                    <div className="challenge-stats">
                      <div className="stat">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{challenge.totalParticipants || 0}</span>
                      </div>
                      {challenge.friendParticipants > 0 && (
                        <div className="stat friends-joined">
                          <span className="stat-icon">👯</span>
                          <span className="stat-value">{challenge.friendParticipants} friends</span>
                        </div>
                      )}
                    </div>
                    <div className="challenge-duration">
                      <span>📅 {challenge.duration_days} days</span>
                      <span>🎯 {challenge.goal}</span>
                    </div>
                    {isJoined ? (
                      <button className="button joined-btn" disabled>✓ Joined</button>
                    ) : (
                      <button className="button join-btn" onClick={() => joinChallenge(challenge.id)}>
                        Join Challenge
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="community-section">
          <h2>Top Streaks</h2>
          {leaderboard.length === 0 ? (
            <p className="empty-message">No streaks yet. Complete your habits to get on the board!</p>
          ) : (
            <div className="leaderboard">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-item rank-${index + 1}`}>
                  <span className="rank">#{index + 1}</span>
                  <span className="avatar">{entry.profile?.emoji || '👤'}</span>
                  <span className="name">{entry.profile?.name || 'Glow User'}</span>
                  <span className="streak">🔥 {entry.streak_count} days</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
