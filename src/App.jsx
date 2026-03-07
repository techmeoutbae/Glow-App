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
  const [currentPage, setCurrentPage] = useState("daily");
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
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [templateHabits, setTemplateHabits] = useState([]);
  
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipTarget, setTooltipTarget] = useState(null);
  
  // Active archetype profile
  const [activeArchetype, setActiveArchetype] = useState(() => {
    const saved = localStorage.getItem('activeArchetype');
    return saved ? JSON.parse(saved) : null;
  });

  // Show all tasks from all archetypes
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Track which archetypes user has adopted
  const [adoptedArchetypes, setAdoptedArchetypes] = useState(() => {
    const saved = localStorage.getItem('adoptedArchetypes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState("");
  const [taskCategory, setTaskCategory] = useState("Growth");
  const [taskTime, setTaskTime] = useState("09:00");
  const [taskDay, setTaskDay] = useState("Today");
  const [isAllDay, setIsAllDay] = useState(false);
  const [identityTags, setIdentityTags] = useState([]);
  const [twoMinVersion, setTwoMinVersion] = useState("");
  
  // Identity form
  const [newIdentityName, setNewIdentityName] = useState("");
  const [newIdentityEmoji, setNewIdentityEmoji] = useState("✨");

  const categoriesList = ["Beauty", "Growth", "Health", "Wellness", "Mindset", "Work", "School"];
  const days = ["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
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
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from("Tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      logError("Tasks.select", { error: tasksError });
      setTasks(tasksData || []);
    } catch (e) { 
      console.error("Tasks load error:", e); 
    }

    try {
      const result = await supabase.from("DayLogs").select("*").limit(10);
      logError("DayLogs.select", result);
      setDayLogs(result.data || []);
    } catch (e) { /* ignore */ }

    try {
      const result = await supabase.from("completion_logs").select("*").limit(10);
      logError("completion_logs.select", result);
      setCompletionLogs(result.data || []);
    } catch (e) { /* ignore */ }

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
      .from("Tasks")
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
      
      const result = await supabase.from("Tasks").insert({
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
      logError("Tasks.insert", result);
    }

    setOnboardingStep(null);
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
      const { error } = await supabase.from("Tasks").insert({
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
      logError("Tasks.insert (addHabit)", { error });

      if (!error) {
        setNewTask("");
        setTwoMinVersion("");
        setIdentityTags([]);
        setShowAddHabit(false);
        loadData();
      }
    } catch (e) { console.log("Add habit error:", e); }
  }

  async function toggleTask(id, completed) {
    const task = tasks.find(t => t.id === id);
    
    if (completed) {
      setFrictionTask(task);
      setShowFrictionModal(true);
      return;
    }

    const result = await supabase
      .from("Tasks")
      .update({ completed: true })
      .eq("id", id);
    logError("Tasks.update (toggleTask)", result);
    
    loadData();
  }

  async function submitTwoMinute() {
    if (!frictionTask) return;

    for (const identityId of (frictionTask.identity_tags || [])) {
      const result = await supabase.from("completion_logs").insert({
        task_id: frictionTask.id,
        identity_id: identityId,
        user_id: session?.user?.id,
        was_two_minute: true,
        completed_at: new Date().toISOString(),
      });
      logError("completion_logs.insert", result);
    }

    await supabase
      .from("Tasks")
      .update({ completed: true })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
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
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("Tasks")
      .update({ completed: true })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
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
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("Tasks")
      .update({ completed: false })
      .eq("id", frictionTask.id);

    setShowFrictionModal(false);
    setFrictionTask(null);
    setFrictionReason("");
    loadData();
  }

  async function deleteTask(id) {
    const result = await supabase.from("Tasks").delete().eq("id", id);
    logError("Tasks.delete", result);
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
    await supabase.from("Tasks").delete().eq("archetype_id", archetype.id);
    
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
    await supabase.from("Tasks").delete().eq("archetype_id", archetype.id);
    
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

  const getGlowScore = () => {
    const today = new Date().toDateString();
    const todayLogs = completionLogs.filter(l => 
      new Date(l.completed_at).toDateString() === today
    );
    const completedCount = todayLogs.filter(l => !l.friction_reason || l.friction_reason !== "skipped").length;
    return completedCount * 10;
  };

  const getIdentityScore = (identityId) => {
    const logs = completionLogs.filter(l => l.identity_id === identityId);
    const completed = logs.filter(l => !l.friction_reason || l.friction_reason !== "skipped");
    return completed.length * 10;
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
    // If no archetype selected, show nothing
    if (!activeArchetype) {
      return [];
    }
    
    let filtered = tasks || [];
    
    // Filter by active archetype unless showAllTasks is enabled
    if (!showAllTasks) {
      filtered = filtered.filter(t => t.archetype_id === activeArchetype.id);
    } else {
      // ShowAllTasks: filter to adopted archetypes only
      const adoptedIds = adoptedArchetypes.map(a => a.id);
      filtered = filtered.filter(t => !t.archetype_id || adoptedIds.includes(t.archetype_id));
    }
    
    // Filter by page (daily vs work)
    if (currentPage === "work") {
      filtered = filtered.filter(t => t.page === "work");
    } else {
      filtered = filtered.filter(t => !t.page || t.page === "daily");
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
          onSkip={() => setOnboardingStep(null)}
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
            <h3>Your Identities</h3>
            <div className="identity-list">
              {identityOptions.map(id => (
                <div key={id.id} className="identity-list-item">
                  <span>{id.emoji} {id.name}</span>
                  <span className="identity-score">{id.score} pts</span>
                </div>
              ))}
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
      </div>

      <h1 className="title">
        {currentPage === "daily" ? "Glow ✧" : "Work Glow ✧"}
      </h1>

      <div className="archetype-selector">
        {adoptedArchetypes.length > 0 ? (
          <div className="adopted-archetypes-row">
            {adoptedArchetypes.map(arch => (
              <div
                key={arch.id}
                className={`adopted-archetype-chip ${activeArchetype?.id === arch.id ? 'active' : ''}`}
                onClick={() => switchToArchetype(arch)}
              >
                <span className="archetype-emoji">{arch.emoji}</span>
                <span className="archetype-name">{arch.name}</span>
              </div>
            ))}
          </div>
        ) : activeArchetype ? (
          <div className="selected-archetype" onClick={() => setShowSettings(true)}>
            <span className="archetype-emoji">{activeArchetype.emoji}</span>
            <span className="archetype-name">{activeArchetype.name}</span>
            <span className="switch-hint">(tap to switch)</span>
          </div>
        ) : (
          <select 
            className="archetype-dropdown"
            name="archetypeSelect"
            value={activeArchetype?.id || ""}
            onChange={(e) => {
              const arch = archetypes.find(a => a.id === e.target.value);
              if (arch) switchToArchetype(arch);
            }}
          >
            <option value="">Select Archetype</option>
            {archetypes.map(arch => (
              <option key={arch.id} value={arch.id}>
                {arch.emoji} {arch.name}
              </option>
            ))}
          </select>
        )}
        <div className="add-dropdown">
          <button className="add-btn" onClick={() => setShowAddHabit(true)}>
            + Add
          </button>
          <div className="add-dropdown-content">
            <button onClick={() => { setShowAddHabit(true); }}>
              + Add Habit
            </button>
            <button onClick={() => { setShowSettings(true); }}>
              + Add Archetype
            </button>
          </div>
        </div>
      </div>

      {activeArchetype && (
        <div className="view-toggle">
          <button 
            className={`view-toggle-btn ${!showAllTasks ? 'active' : ''}`}
            onClick={() => setShowAllTasks(false)}
          >
            {activeArchetype.emoji} {activeArchetype.name}
          </button>
          <button 
            className={`view-toggle-btn ${showAllTasks ? 'active' : ''}`}
            onClick={() => setShowAllTasks(true)}
          >
            ✨ All Tasks
          </button>
        </div>
      )}

      <div className="identities-bar">
        {identityOptions.map(id => (
          <div key={id.id} className="identity-chip" title={`Score: ${id.score}`}>
            <span className="identity-emoji">{id.emoji}</span>
            <span className="identity-name">{id.name}</span>
            {id.score > 0 && <span className="identity-score">{id.score}</span>}
          </div>
        ))}
      </div>

      <div className="day-selector">
        <select 
          className="day-select"
          name="daySelect"
          value={expandedDay || ""}
          onChange={(e) => setExpandedDay(e.target.value || null)}
        >
          <option value="">Weekly View</option>
          {days.filter(d => d !== "Today").map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {!expandedDay ? (
        <div className="calendar">
          {days.filter(d => d !== "Today").map(day => {
            const dayTasks = pageTasks.filter(t => {
              const taskDays = parseDays(t.days);
              const isAllDay = t.is_all_day === true;
              const hasDays = Array.isArray(taskDays) && taskDays.length > 0;
              return isAllDay || !hasDays || taskDays.includes(day);
            });
            
            return (
              <div key={day} className="day-box" onClick={() => setExpandedDay(day)}>
                <h3>{day}{day === today && <span className="today-sparkle">✧</span>}</h3>
                {dayTasks.length > 0 ? (
                  <p className="day-progress">{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</p>
                ) : (
                  <p className="day-progress empty">No tasks</p>
                )}
                
                {categoriesList.map(category => {
                  const categoryTasks = dayTasks.filter(t => t.category === category);
                  if (!categoryTasks.length) return null;
                  return (
                    <div key={category} className="task-category-section">
                      <span className="category-label">{category}</span>
                      {categoryTasks.slice(0, 2).map(task => (
                        <div key={task.id} className={`task-row-compact ${task.completed ? "completed" : ""}`}>
                          <span className="task-text">{task.title}</span>
                        </div>
                      ))}
                      {categoryTasks.length > 2 && <p className="more-tasks">+{categoryTasks.length - 2} more</p>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {pageTasks.length === 0 && (
            <div className="empty-state">
              <p>No habits yet!</p>
              <p className="empty-hint">Add your first habit to get started</p>
            </div>
          )}
        </div>
      ) : (
        <div className="day-view">
          <button className="back-btn full-width" onClick={() => setExpandedDay(null)}>← Back</button>
          <div className="day-view-header">
            <h2>{expandedDay}</h2>
            <button className="add-btn" onClick={() => setShowAddHabit(true)}>+ Add</button>
          </div>
          {(() => {
            const dayTasks = pageTasks.filter(t => {
              const taskDays = parseDays(t.days);
              const isAllDay = t.is_all_day === true;
              const hasDays = Array.isArray(taskDays) && taskDays.length > 0;
              return isAllDay || !hasDays || taskDays.includes(expandedDay);
            });
            
            if (!dayTasks.length) return <p className="empty">No habits for {expandedDay}. Add a habit to get started!</p>;
            
            const sortedTasks = sortByTime(dayTasks);
            
            const morningTasks = sortedTasks.filter(t => getTimeOfDay(t.time) === 'Morning' || t.is_all_day);
            const afternoonTasks = sortedTasks.filter(t => getTimeOfDay(t.time) === 'Afternoon');
            const eveningTasks = sortedTasks.filter(t => getTimeOfDay(t.time) === 'Evening');
            
            const renderTasks = (tasks, label) => {
              if (!tasks.length) return null;
              return (
                <div key={label} className="time-section">
                  <h4 className="time-label">{label}</h4>
                  {tasks.map(task => (
                    <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                      <label className="task-label">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id, task.completed)}
                        />
                        <span className="task-time">
                          {task.is_all_day ? "All Day" : formatTime(task.time)}
                        </span>
                        <span className="task-text">{task.title}</span>
                      </label>
                      {task.category && (
                        <span className="category-tag">{task.category}</span>
                      )}
                      <button className="delete-btn" onClick={() => deleteTask(task.id)}>×</button>
                    </div>
                  ))}
                </div>
              );
            };
            
            return (
              <>
                {renderTasks(morningTasks, 'Morning')}
                {renderTasks(afternoonTasks, 'Afternoon')}
                {renderTasks(eveningTasks, 'Evening')}
              </>
            );
          })()}
        </div>
      )}

      {showAddHabit && (
        <div className="modal-overlay" onClick={() => setShowAddHabit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Habit</h2>
              <button onClick={() => setShowAddHabit(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <input
                className="input"
                placeholder="What habit do you want to build?"
                name="habitTitle"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              
              <select
                className="input"
                name="habitCategory"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
              >
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div className="identity-selector">
                <p>Builds Identity:</p>
                <div className="identity-options">
                  {identityOptions.map(id => (
                    <button
                      key={id.id}
                      className={`identity-option ${identityTags.includes(id.id) ? "selected" : ""}`}
                      onClick={() => {
                        setIdentityTags(prev => 
                          prev.includes(id.id)
                            ? prev.filter(i => i !== id.id)
                            : [...prev, id.id]
                        );
                      }}
                    >
                      {id.emoji} {id.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <select
                  className="input"
                  name="habitDay"
                  value={taskDay}
                  onChange={(e) => setTaskDay(e.target.value)}
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isAllDay"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  All Day
                </label>
              </div>

              {!isAllDay && (
                <select
                  className="input"
                  name="habitTime"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                >
                  {Array.from({ length: 48 }, (_, i) => {
                    const hours = Math.floor(i / 2);
                    const mins = (i % 2) * 30;
                    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                    const ampm = hours < 12 ? "AM" : "PM";
                    return (
                      <option key={i} value={`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`}>
                        {`${hour12}:${mins.toString().padStart(2, "0")} ${ampm}`}
                      </option>
                    );
                  })}
                </select>
              )}

              <input
                className="input"
                placeholder="Two-minute version (optional)"
                value={twoMinVersion}
                onChange={(e) => setTwoMinVersion(e.target.value)}
              />

              <button className="button" onClick={addHabit}>Create Habit</button>
            </div>
          </div>
        </div>
      )}

      {showFrictionModal && frictionTask && (
        <div className="modal-overlay" onClick={() => setShowFrictionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Almost Done!</h2>
              <button onClick={() => setShowFrictionModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p className="friction-text">
                You're uncompleting "{frictionTask.title}". What happened?
              </p>
              
              <input
                className="input"
                placeholder="Reason (optional)"
                value={frictionReason}
                onChange={(e) => setFrictionReason(e.target.value)}
              />

              <div className="friction-buttons">
                <button className="button primary" onClick={submitTwoMinute}>
                  ✨ Did 2-min version
                </button>
                <button className="button primary" onClick={submitWithReason}>
                  ✓ Completed anyway
                </button>
                <button className="button secondary" onClick={skipHabit}>
                  Skip for today
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddIdentity && (
        <div className="modal-overlay" onClick={() => setShowAddIdentity(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Identity</h2>
              <button onClick={() => setShowAddIdentity(false)}>×</button>
            </div>
            <div className="modal-content">
              <input
                className="input"
                placeholder="Identity name (e.g., Radiant Woman)"
                value={newIdentityName}
                onChange={(e) => setNewIdentityName(e.target.value)}
              />
              
              <select
                className="input"
                value={newIdentityEmoji}
                onChange={(e) => setNewIdentityEmoji(e.target.value)}
              >
                <option value="✨">✨ Radiant</option>
                <option value="💎">💎 Precious</option>
                <option value="🌟">🌟 Star</option>
                <option value="🔥">🔥 Fire</option>
                <option value="💪">💪 Strong</option>
                <option value="🧘">🧘 Calm</option>
                <option value="⚡">⚡ Power</option>
                <option value="🌸">🌸 Bloom</option>
                <option value="💰">💰 Wealth</option>
                <option value="🎯">🎯 Focus</option>
              </select>

              <button className="button" onClick={addIdentity}>Create Identity</button>
            </div>
          </div>
        </div>
      )}

      {showArchetypeModal && selectedArchetype && (
        <div className="modal-overlay" onClick={() => setShowArchetypeModal(false)}>
          <div className="modal archetype-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="archetype-modal-emoji">{selectedArchetype.emoji}</span>
              <h2>{selectedArchetype.name}</h2>
              <button onClick={() => setShowArchetypeModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p className="archetype-description">{selectedArchetype.description}</p>
              
              <div className="archetype-identities">
                <p className="archetype-section-label">Builds:</p>
                <div className="archetype-identity-tags">
                  {(selectedArchetype.default_identities || []).map((id, idx) => (
                    <span key={idx} className="archetype-identity-tag">{id}</span>
                  ))}
                </div>
              </div>

              <div className="archetype-habits">
                <p className="archetype-section-label">Template Habits:</p>
                <ul className="archetype-habits-list">
                  {((selectedArchetype.template_habits || [])).map((habit, idx) => (
                    <li key={idx}>
                      <span className="habit-title">{habit.title}</span>
                      {habit.twoMin && (
                        <span className="habit-two-min">2-min: {habit.twoMin}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className="button adopt-button" 
                onClick={() => adoptArchetype(selectedArchetype)}
                disabled={isAdopting}
              >
                {isAdopting ? 'Adopting...' : `Adopt ${selectedArchetype.name}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glow-score-display">
        <span className="glow-score-label">Today's Glow</span>
        <span className="glow-score-value">{getGlowScore()} ✧</span>
      </div>
        </>
      )}
      
      <FeatureTooltip 
        show={showTooltip} 
        target={tooltipTarget} 
        onClose={() => setShowTooltip(null)} 
      />
    </div>
  );
}
