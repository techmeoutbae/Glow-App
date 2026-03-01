import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
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
                value={habit.title}
                onChange={(e) => onUpdate(idx, 'title', e.target.value)}
              />
              <input
                className="input two-min"
                placeholder="2-min version"
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
  const [categories, setCategories] = useState(["Beauty", "Growth", "Health", "Wellness"]);
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
  const [activeArchetype, setActiveArchetype] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
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

  const categoriesList = ["Beauty", "Growth", "Health", "Wellness", "Mindset"];
  const days = ["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const defaultIdentities = [
    { id: 'DISCIPLINED_CREATOR', name: 'Disciplined Creator', emoji: '🎯' },
    { id: 'HEALTHY_WOMAN', name: 'Healthy Woman', emoji: '💎' },
    { id: 'WEALTH_BUILDER', name: 'Wealth Builder', emoji: '💰' },
    { id: 'CALM_GROUNDED', name: 'Calm & Grounded', emoji: '🧘' },
    { id: 'ELITE_PERFORMER', name: 'Elite Performer', emoji: '⚡' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Only show onboarding on initial signup - when NO identities AND NO tasks
    if (identities.length === 0 && tasks.length === 0 && archetypes.length > 0 && !hasCompletedOnboarding) {
      setOnboardingStep('welcome');
    }
  }, [identities, tasks, archetypes]);

  async function loadData() {
    // Load all tasks without user filter for now
    const { data: tasksData } = await supabase
      .from("Tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setTasks(tasksData || []);
    console.log("Loaded tasks:", tasksData?.length);

    // Load other data
    const { data: logsData } = await supabase.from("DayLogs").select("*").limit(10);
    setDayLogs(logsData || []);

    const { data: compLogs } = await supabase.from("completion_logs").select("*").limit(10);
    setCompletionLogs(compLogs || []);

    const { data: ids } = await supabase.from("identities").select("*").limit(10);
    setIdentities(ids || []);

    const { data: archs } = await supabase.from("archetypes").select("*");
    setArchetypes(archs || []);
  }

  async function adoptArchetype(archetype) {
    setSelectedArchetype(archetype);
    setTemplateHabits(archetype.template_habits || []);
    setShowArchetypeModal(false);
    setOnboardingStep('template');
  }

  async function saveTemplateAndFinish() {
    setIsAdopting(true);
    
    const identityEmojis = {
      'Disciplined': '🎯',
      'Creative': '✨',
      'Consistent': '🔄',
      'Fit': '💪',
      'Nourished': '🥗',
      'Energetic': '⚡',
      'Strategic': '♟️',
      'Financially Aware': '📊',
      'Focused': '🎯',
      'Calm': '🧘',
      'Self-Aware': '🔮',
      'Balanced': '⚖️',
      'High Standard': '⭐',
      'Resilient': '💎'
    };

    const createdIdentities = [];
    
    for (const identityName of selectedArchetype.default_identities) {
      const { data: newIdentity, error } = await supabase.from("identities").insert({
        name: identityName,
        emoji: identityEmojis[identityName] || '✨',
        user_id: session.user.id,
      }).select().single();
      
      if (!error && newIdentity) {
        createdIdentities.push(newIdentity);
      }
    }

    for (const habit of templateHabits) {
      const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      await supabase.from("Tasks").insert({
        title: habit.title,
        category: "Growth",
        completed: false,
        page: "daily",
        time: "09:00",
        is_all_day: false,
        day: "Monday",
        days: `{${allDays.join(',')}}`,
        identity_tags: createdIdentities.map(i => i.id),
        two_minute_version: habit.twoMin || null,
        user_id: session.user.id,
      });
    }

    setOnboardingStep(null);
    setSelectedArchetype(null);
    setTemplateHabits([]);
    setIsAdopting(false);
    setHasCompletedOnboarding(true);
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

    const { error } = await supabase.from("Tasks").insert({
      title: newTask,
      category: taskCategory,
      completed: false,
      page: currentPage,
      time: isAllDay ? null : taskTime,
      is_all_day: isAllDay,
      day: actualDay,
      days: `{${actualDay}}`,
      identity_tags: identityTags,
      two_minute_version: twoMinVersion || null,
      user_id: session.user.id,
    });

    if (!error) {
      setNewTask("");
      setTwoMinVersion("");
      setIdentityTags([]);
      setShowAddHabit(false);
      loadData();
    }
  }

  async function toggleTask(id, completed) {
    const task = tasks.find(t => t.id === id);
    
    if (completed) {
      setFrictionTask(task);
      setShowFrictionModal(true);
      return;
    }

    for (const identityId of (task.identity_tags || [])) {
      await supabase.from("completion_logs").insert({
        task_id: id,
        identity_id: identityId,
        user_id: session.user.id,
        was_two_minute: false,
        completed_at: new Date().toISOString(),
      });
    }

    await supabase
      .from("Tasks")
      .update({ completed: true })
      .eq("id", id);
    
    loadData();
  }

  async function submitTwoMinute() {
    if (!frictionTask) return;

    for (const identityId of (frictionTask.identity_tags || [])) {
      await supabase.from("completion_logs").insert({
        task_id: frictionTask.id,
        identity_id: identityId,
        user_id: session.user.id,
        was_two_minute: true,
        completed_at: new Date().toISOString(),
      });
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
      user_id: session.user.id,
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
      user_id: session.user.id,
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
    await supabase.from("Tasks").delete().eq("id", id);
    loadData();
  }

  async function addIdentity() {
    if (!newIdentityName.trim()) return;

    const { error } = await supabase.from("identities").insert({
      name: newIdentityName,
      emoji: newIdentityEmoji,
      user_id: session.user.id,
    });

    if (!error) {
      setNewIdentityName("");
      setNewIdentityEmoji("✨");
      setShowAddIdentity(false);
      loadData();
    }
  }

  async function deleteIdentity(id) {
    await supabase.from("identities").delete().eq("id", id);
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
    
    if (!error) {
      loadData();
    }
  }

  async function switchToArchetype(archetype) {
    setActiveArchetype(archetype);
    setOnboardingStep('template');
    setTemplateHabits(archetype.template_habits || []);
    setSelectedArchetype(archetype);
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

  const identityOptions = identities.length > 0 
    ? identities.map(i => ({ 
        ...i, 
        score: getIdentityScore(i.id) 
      }))
    : defaultIdentities.map(i => ({ ...i, score: 0 }));

  const getPageTasks = () => {
    return tasks || [];
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
            <h3>Switch Archetype</h3>
            <p className="settings-hint">Switch to a different archetype profile</p>
            <div className="archetype-switcher">
              {archetypes.map(arch => (
                <button
                  key={arch.id}
                  className={`archetype-switch-btn ${activeArchetype?.id === arch.id ? 'active' : ''}`}
                  onClick={() => switchToArchetype(arch)}
                >
                  {arch.emoji} {arch.name}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Add New Archetype</h3>
            <p className="settings-hint">Create your own custom archetype</p>
            <input
              className="input"
              placeholder="Archetype name"
              value={newIdentityName}
              onChange={(e) => setNewIdentityName(e.target.value)}
            />
            <select
              className="input"
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
        <select 
          className="archetype-dropdown"
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
        <button className="add-btn" onClick={() => setShowAddHabit(true)}>
          + Add
        </button>
        <button className="add-btn small" onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </div>

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
            const dayTasks = pageTasks.filter(t => 
              t.is_all_day || (t.days && t.days.includes(day))
            );
            if (!dayTasks.length) return null;
            
            return (
              <div key={day} className="day-box" onClick={() => setExpandedDay(day)}>
                <h3>{day}{day === today && <span className="today-sparkle">✧</span>}</h3>
                <p className="day-progress">{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</p>
                
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className={`task-row-compact ${task.completed ? "completed" : ""}`}>
                    <span className="task-text">{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && <p className="more-tasks">+{dayTasks.length - 3} more</p>}
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
          <div className="day-view-header">
            <button className="back-btn" onClick={() => setExpandedDay(null)}>← Back</button>
            <h2>{expandedDay}</h2>
            <button className="add-btn" onClick={() => setShowAddHabit(true)}>+ Add</button>
          </div>
          {(() => {
            const dayTasks = pageTasks.filter(t => 
              t.is_all_day || (t.days && t.days.includes(expandedDay))
            );
            
            if (!dayTasks.length) return <p className="empty">No habits for {expandedDay}. Add a habit to get started!</p>;
            
            return dayTasks.map(task => (
              <div key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  <span className="task-time">
                    {task.is_all_day ? "All Day" : task.time}
                  </span>
                  <span className="task-text">{task.title}</span>
                </label>
                {task.category && (
                  <span className="category-tag">{task.category}</span>
                )}
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>×</button>
              </div>
            ));
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
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              
              <select
                className="input"
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
                  value={taskDay}
                  onChange={(e) => setTaskDay(e.target.value)}
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  All Day
                </label>
              </div>

              {!isAllDay && (
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
