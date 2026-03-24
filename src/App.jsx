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
  const [friends, setFriends] = useState([]);

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
            <p>Select an archetype that represents who you want to become</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">💎</span>
            <h3>Build Your Identity</h3>
            <p>Each habit you complete reinforces the identity you're building</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">✨</span>
            <h3>Earn Glow Points</h3>
            <p>+3 per habit, +1 per todo, +25 bonus at 100% completion!</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">📝</span>
            <h3>Daily To-Do List</h3>
            <p>Add quick tasks that reset at midnight and count toward your glow</p>
          </div>
          
          <div className="onboarding-card">
            <span className="card-icon">👥</span>
            <h3>Stay Accountable</h3>
            <p>Connect with friends to share progress and motivate each other</p>
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

function TemplateEditor({ archetype, habits, onUpdate, onAdd, onRemove, onSave, onBack, isSaving, identities = [], onAddIdentity, onRemoveIdentity, onCreateIdentity }) {
  const [newIdentityName, setNewIdentityName] = useState("");
  const [showAddIdentity, setShowAddIdentity] = useState(false);
  
  return (
    <div className="onboarding-screen">
      <div className="onboarding-content wide">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="onboarding-emoji">{archetype.emoji}</span>
        <h1 className="onboarding-title">Customize Your {archetype.name} Template</h1>
        <p className="onboarding-subtitle">Edit the habits and identities below. Tap to modify.</p>
        
        {/* Identities Section */}
        <div className="template-section">
          <h3>Identities</h3>
          <p className="section-hint">These identities will be reinforced by your habits</p>
          <div className="template-identities">
            {identities.map((identity, idx) => (
              <div key={idx} className="template-identity-tag">
                <span>{identity.emoji || '✨'} {identity.name}</span>
                <button className="remove-btn" onClick={() => onRemoveIdentity(idx)}>×</button>
              </div>
            ))}
          </div>
          
          <div className="add-identity-row">
            <button 
              className="button secondary small" 
              onClick={() => setShowAddIdentity(!showAddIdentity)}
            >
              + Add Existing Identity
            </button>
            <button 
              className="button secondary small" 
              onClick={() => onCreateIdentity && onCreateIdentity()}
            >
              + Create New Identity
            </button>
          </div>
          
          {showAddIdentity && (
            <div className="add-identity-form">
              <select 
                className="input"
                onChange={(e) => {
                  if (e.target.value) {
                    onAddIdentity(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Select an identity...</option>
                <option value="HEALTHY">HEALTHY 💪</option>
                <option value="FIT">FIT 🏃</option>
                <option value="STRONG">STRONG 💪</option>
                <option value="ENERGETIC">ENERGETIC ⚡</option>
                <option value="NOURISHED">NOURISHED 🥗</option>
                <option value="GROWTH">GROWTH 🌱</option>
                <option value="MINDFUL">MINDFUL 🧠</option>
                <option value="FOCUSED">FOCUSED 🎯</option>
                <option value="DISCIPLINED">DISCIPLINED 📏</option>
                <option value="GRATEFUL">GRATEFUL 🙏</option>
                <option value="WEALTHY">WEALTHY 💎</option>
                <option value="FINANCIALLY WISE">FINANCIALLY WISE 💰</option>
                <option value="ABUNDANT">ABUNDANT 🌟</option>
                <option value="RADIANT">RADIANT ✨</option>
                <option value="BEAUTIFUL">BEAUTIFUL 🌸</option>
                <option value="SUCCESSFUL">SUCCESSFUL 🏆</option>
                <option value="ACHIEVER">ACHIEVER 🎯</option>
                <option value="DRIVEN">DRIVEN 🚀</option>
                <option value="LOVING">LOVING ❤️</option>
                <option value="CONNECTED">CONNECTED 🤝</option>
                <option value="SPIRITUAL">SPIRITUAL 🧘‍♀️</option>
                <option value="PEACEFUL">PEACEFUL ☮️</option>
                <option value="BALANCED">BALANCED ⚖️</option>
                <option value="CONFIDENT">CONFIDENT 💫</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Habits Section */}
        <div className="template-section">
          <h3>Habits</h3>
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
  const [userName, setUserName] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
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
  const [minimizeGlow, setMinimizeGlow] = useState(false);
  const [lastCompletedType, setLastCompletedType] = useState(null);
  
  // Daily recap popup state
  const [showDailyRecap, setShowDailyRecap] = useState(false);
  const [recapData, setRecapData] = useState({ earned: 0, penalty: 0, total: 0 });
  
  // Edit habit state
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [templateHabits, setTemplateHabits] = useState([]);
  const [templateIdentities, setTemplateIdentities] = useState([]);
  
  // Check for first-time users and show onboarding (only when session changes and user is logged in)
  useEffect(() => {
    if (session?.user?.id) {
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
      if (!hasCompletedOnboarding) {
        setOnboardingStep('welcome');
      } else {
        setOnboardingStep(null);
      }
    }
  }, [session]);
  
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
  const [challengeRefreshKey, setChallengeRefreshKey] = useState(0);
  
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [editingCategoryIdentities, setEditingCategoryIdentities] = useState(null);
  
  // Categories
  const defaultCategories = ["Health", "Mindset", "Finances", "Beauty", "Career", "Relationships", "Spirituality"];
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const categoriesList = [...defaultCategories, ...customCategories];
  
  const addCustomCategory = () => {
    if (newCategoryName.trim() && !categoriesList.includes(newCategoryName.trim())) {
      const updated = [...customCategories, newCategoryName.trim()];
      setCustomCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };
  
  const deleteCustomCategory = (cat) => {
    const confirmed = confirm(`Delete category "${cat}"?`);
    if (!confirmed) return;
    const updated = customCategories.filter(c => c !== cat);
    setCustomCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));
  };
  
  // Category to Identity mapping
  const defaultCategoryIdentities = {
    'Health': ['HEALTHY', 'FIT', 'STRONG', 'ENERGETIC', 'NOURISHED'],
    'Mindset': ['GROWTH', 'MINDFUL', 'FOCUSED', 'DISCIPLINED', 'GRATEFUL'],
    'Finances': ['WEALTHY', 'FINANCIALLY WISE', 'ABUNDANT', 'PROSPEROUS'],
    'Beauty': ['RADIANT', 'BEAUTIFUL', 'GLOWING', 'CONFIDENT'],
    'Career': ['SUCCESSFUL', 'ACHIEVER', 'DRIVEN', 'STRATEGIC', 'EXCELLENT'],
    'Relationships': ['LOVING', 'CONNECTED', 'SUPPORTIVE', 'COMPASSIONATE'],
    'Spirituality': ['SPIRITUAL', 'INTUITIVE', 'PEACEFUL', 'CENTERED'],
  };
  const [categoryIdentities, setCategoryIdentities] = useState(() => {
    const saved = localStorage.getItem('categoryIdentities');
    return saved ? JSON.parse(saved) : defaultCategoryIdentities;
  });
  
  // All possible identities that can be adopted
  const allPossibleIdentities = [
    // Health
    'HEALTHY', 'FIT', 'STRONG', 'ENERGETIC', 'VIBRANT', 'NOURISHED', 'VITALITY', 'ACTIVE', 'WELL',
    // Mindset
    'GROWTH', 'MINDFUL', 'AWARE', 'PRESENT', 'FOCUSED', 'DISCIPLINED', 'CONSISTENT', 'DETERMINED', 'RESILIENT', 'GRATEFUL', 'POSITIVE', 'OPTIMISTIC', 'BRAVE', 'CALM', 'PEACEFUL',
    // Beauty
    'BEAUTIFUL', 'RADIANT', 'GLOWING', 'CONFIDENT', 'CARED_FOR',
    // Career
    'SUCCESSFUL', 'ACHIEVER', 'DRIVEN', 'AMBITION', 'PROFESSIONAL', 'EXCELLENT', 'TOP_PERFORMER', 'STRATEGIC', 'INNOVATIVE', 'CREATIVE',
    // Finances
    'WEALTHY', 'FINANCIALLY WISE', 'ABUNDANT', 'PROSPEROUS', 'MONEY_CONSCIOUS', 'FINANCIALLY FREE',
    // Relationships
    'LOVING', 'CONNECTED', 'SUPPORTIVE', 'COMPASSIONATE', 'HARMONIOUS', 'SOCIABLE',
    // Spirituality
    'SPIRITUAL', 'GROUNDED', 'INTUITIVE', 'CENTERED', 'WHOLE', 'INTEGRATED', 'PURPOSEFUL',
  ];
  
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
  
  // Daily To-do state
  const [showTodoList, setShowTodoList] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [todoCategory, setTodoCategory] = useState(() => defaultCategories[0] || "Health");
  const [todos, setTodos] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`dailyTodos_${today}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Refresh todos when day changes (midnight reset)
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`dailyTodos_${today}`);
      setTodos(saved ? JSON.parse(saved) : []);
    };
    
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    const midnightTimer = setTimeout(checkDayChange, msUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  const days = ["Today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Calculate end-of-day penalty for yesterday's incomplete tasks
  const calculateEndOfDayPenalty = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    const yesterdayName = yesterday.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if penalty already calculated for yesterday
    const penalties = JSON.parse(localStorage.getItem('dailyPenalties') || '{}');
    if (penalties[yesterdayISO] !== undefined) return penalties[yesterdayISO];
    
    // Count incomplete habits from yesterday
    const yesterdayTasks = tasks.filter(t => {
      if (t.is_all_day) return true;
      const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
      return taskDays?.includes(yesterdayName);
    });
    
    let incompleteCount = 0;
    yesterdayTasks.forEach(t => {
      const completed = localStorage.getItem(`task_completed_${yesterdayISO}_${t.id}`) === 'true';
      if (!completed) incompleteCount++;
    });
    
    // Count incomplete todos from yesterday
    const yesterdayTodos = JSON.parse(localStorage.getItem(`dailyTodos_${yesterdayISO}`) || '[]');
    const incompleteTodos = yesterdayTodos.filter(t => !t.completed).length;
    incompleteCount += incompleteTodos;
    
    // Calculate penalty: -1 for each incomplete
    const penalty = -incompleteCount;
    
    // Store penalty
    penalties[yesterdayISO] = penalty;
    localStorage.setItem('dailyPenalties', JSON.stringify(penalties));
    
    return penalty;
  };
  
  // Get penalty for a specific day
  const getDayPenalty = (dateISO) => {
    const penalties = JSON.parse(localStorage.getItem('dailyPenalties') || '{}');
    return penalties[dateISO] || 0;
  };
  
  // Midnight reset - runs at user's local midnight (12 AM)
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const today = now.toDateString();
      const lastReset = localStorage.getItem('lastResetDate');
      
      // Reset at midnight (when date changes)
      if (lastReset !== today) {
        // Calculate penalty for yesterday before resetting
        calculateEndOfDayPenalty();
        
        localStorage.setItem('lastResetDate', today);
        
        // Trigger re-render to refresh all daily data
        setRefreshKey(k => k + 1);
        
        // Reload data from Supabase
        loadData();
      }
    };
    
    // Check immediately on load
    checkMidnight();
    
    // Set up interval to check every minute
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [loadData]);
  
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
    { id: 'GROUNDED', name: 'Grounded', emoji: '🌿' },
    { id: 'RADIANT', name: 'Radiant', emoji: '✨' },
    { id: 'FOCUSED', name: 'Focused', emoji: '🎯' },
    { id: 'MINDFUL', name: 'Mindful', emoji: '🧘‍♀️' },
    { id: 'ENERGIZED', name: 'Energized', emoji: '⚡' },
    { id: 'CONFIDENT', name: 'Confident', emoji: '💫' },
    { id: 'BEAUTIFUL', name: 'Beautiful', emoji: '🌸' },
    { id: 'WEALTHY', name: 'Wealthy', emoji: '💎' },
    { id: 'HEALTHY', name: 'Healthy', emoji: '💪' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Check for daily recap on app load
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const lastRecapDate = localStorage.getItem('lastRecapDate');
    const today = new Date().toISOString().split('T')[0];
    
    // Show recap only once per day (when it's a new day)
    if (lastRecapDate && lastRecapDate !== today) {
      // Calculate yesterday's stats
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];
      const yesterdayName = yesterday.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get yesterday's completed tasks
      const yesterdayTasks = tasks.filter(t => {
        if (t.is_all_day) return true;
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
        return taskDays?.includes(yesterdayName);
      });
      
      const completedCount = yesterdayTasks.filter(t => 
        localStorage.getItem(`task_completed_${yesterdayISO}_${t.id}`) === 'true'
      ).length;
      
      // Get yesterday's todos
      const yesterdayTodos = JSON.parse(localStorage.getItem(`dailyTodos_${yesterdayISO}`) || '[]');
      const completedTodos = yesterdayTodos.filter(t => t.completed).length;
      
      // Calculate earned points
      const earned = (completedCount * 3) + completedTodos;
      if (completedCount === yesterdayTasks.length && yesterdayTasks.length > 0) {
        earned + 25;
      }
      const earnedPoints = (completedCount * 3) + completedTodos + (completedCount === yesterdayTasks.length && yesterdayTasks.length > 0 ? 25 : 0);
      
      // Get penalty
      const penalties = JSON.parse(localStorage.getItem('dailyPenalties') || '{}');
      const penalty = Math.abs(penalties[yesterdayISO] || 0);
      
      // Only show if there was activity yesterday
      if (yesterdayTasks.length > 0 || yesterdayTodos.length > 0) {
        setRecapData({
          earned: earnedPoints,
          penalty: penalty,
          total: earnedPoints - penalty
        });
        setShowDailyRecap(true);
      }
      
      localStorage.setItem('lastRecapDate', today);
    } else if (!lastRecapDate) {
      localStorage.setItem('lastRecapDate', today);
    }
  }, [session, tasks]);

  useEffect(() => {
    // Only auto-show onboarding on initial load, not when switching archetypes
    // Skip if we already have tasks OR if archetypes just loaded
  }, []);

  // Get unique emoji for identity based on name
  const getIdentityEmoji = (identity) => {
    if (identity.emoji && identity.emoji !== '✨') return identity.emoji;
    
    const emojiMap = {
      // Health & Fitness
      'HEALTHY': '💪', 'FIT': '🏃', 'STRONG': '💪', 'ENERGETIC': '⚡', 'VIBRANT': '🌟',
      'NOURISHED': '🥗', 'VITALITY': '❤️', 'ACTIVE': '🏃', 'WELL': '🧘', 'REFRESHED': '🌿',
      
      // Mindset & Growth
      'GROWTH': '🌱', 'MINDFUL': '🧠', 'AWARE': '👁️', 'PRESENT': '🧘', 'FOCUSED': '🎯',
      'DISCIPLINED': '📏', 'CONSISTENT': '🔄', 'DETERMINED': '💪', 'RESILIENT': '🦋',
      'GRATEFUL': '🙏', 'POSITIVE': '☀️', 'OPTIMISTIC': '🌈', 'BRAVE': '🦁',
      
      // Beauty & Self-care
      'BEAUTIFUL': '🌸', 'RADIANT': '✨', 'GLOWING': '💫', 'CARED_FOR': '💝',
      
      // Career & Success
      'SUCCESSFUL': '🏆', 'ACHIEVER': '🎯', 'DRIVEN': '🚀', 'AMBITION': '⭐', 'PROFESSIONAL': '💼',
      'EXCELLENT': '🌟', 'TOP_PERFORMER': '🏅', 'STRATEGIC': '♟️', 'INNOVATIVE': '💡',
      
      // Finances
      'WEALTHY': '💎', 'FINANCIALLY WISE': '💰', 'ABUNDANT': '🌟', 'PROSPEROUS': '💎',
      'MONEY_CONSCIOUS': '💵', 'FINANCIALLY_FREE': '🗽',
      
      // Relationships
      'LOVING': '❤️', 'CONNECTED': '🤝', 'SUPPORTIVE': '💜', 'COMPASSIONATE': '💕',
      'EMPATHETIC': '💗', 'KIND': '🌸', 'FRIENDLY': '😊', 'HARMONIOUS': '🎵',
      
      // Spirituality
      'PEACEFUL': '☮️', 'SPIRITUAL': '🧘‍♀️', 'INTUITIVE': '👁️', 'CALM': '🕊️', 'CENTERED': '⚖️', 'WHOLE': '💫',
      'INTEGRATED': '🔗', 'ENLIGHTENED': '🕯️', 'DIVINE': '⭐', 'SACRED': '🔮',
      
      // Balance
      'BALANCED': '⚖️', 'GROUNDED': '🌳', 'STABLE': '🏔️', 'ROOTED': '🌲',
      
      // Emotions
      'JOYFUL': '😊', 'HAPPY': '😄', 'BLISSFUL': '🌈', 'CONTENT': '😊', 'SERENE': '🌙',
      
      // Power words
      'CONFIDENT': '💫', 'EMPOWERED': '🦁', 'MIGHTY': '⚡', 'UNSTOPPABLE': '🔥',
      'WORTHY': '💎', 'DESERVING': '🌟', 'ENOUGH': '✅',
      
      // Legacy
      'LEGACY': '📜', 'IMPACT': '🌍', 'MEANINGFUL': '💖', 'PURPOSE': '🎯', 'MISSION': '🎯',
    };
    
    const name = identity.name?.toUpperCase().replace(/[^A-Z]/g, '') || '';
    return emojiMap[name] || '✨';
  };

  async function loadData() {
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    
    // Ensure user profile has email and load name
    if (userId && userEmail) {
      try {
        await supabase.from('user_profiles').upsert({
          id: userId,
          email: userEmail,
        }, { onConflict: 'id' });
        
        // Load user's name
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('id', userId)
          .single();
        if (profile?.name) setUserName(profile.name);
      } catch (e) { console.log("Profile upsert error:", e); }
    }
    
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
      // Load identities only for adopted archetypes or user's own identities
      let identitiesQuery = supabase
        .from("identities")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (userId) {
        // ONLY load identities belonging to the current user
        identitiesQuery = identitiesQuery.eq('user_id', userId);
      }
      
      const result = await identitiesQuery;
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
    setTemplateHabits(arch.template_habits || []);
    // Set default identities from archetype
    if (arch.default_identities && arch.default_identities.length > 0) {
      setTemplateIdentities(arch.default_identities.map(name => ({ name, emoji: '✨' })));
    } else {
      setTemplateIdentities([]);
    }
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
    
    // Combine default identities with template identities
    const allIdentityNames = [
      ...(selectedArchetype.default_identities || []),
      ...templateIdentities.map(i => i.name)
    ];
    
    console.log("Creating identities:", { 
      defaultIdentities: selectedArchetype.default_identities,
      templateIdentities: templateIdentities.map(i => i.name),
      allIdentityNames 
    });
    
    // If no identities to create, skip
    if (allIdentityNames.length === 0) {
      console.log("No identities to create");
    }
    
    // Category mapping for identities
    const identityCategories = {
      'HEALTHY': 'Health', 'FIT': 'Health', 'STRONG': 'Health', 'ENERGETIC': 'Health',
      'VIBRANT': 'Health', 'NOURISHED': 'Health', 'VITALITY': 'Health', 'ACTIVE': 'Health',
      'GROWTH': 'Mindset', 'MINDFUL': 'Mindset', 'AWARE': 'Mindset', 'PRESENT': 'Mindset',
      'FOCUSED': 'Mindset', 'DISCIPLINED': 'Mindset', 'CONSISTENT': 'Mindset',
      'GRATEFUL': 'Mindset', 'POSITIVE': 'Mindset', 'RESILIENT': 'Mindset',
      'BEAUTIFUL': 'Beauty', 'RADIANT': 'Beauty', 'GLOWING': 'Beauty', 'CARED_FOR': 'Beauty',
      'SUCCESSFUL': 'Career', 'ACHIEVER': 'Career', 'DRIVEN': 'Career', 'AMBITION': 'Career',
      'PROFESSIONAL': 'Career', 'EXCELLENT': 'Career', 'INNOVATIVE': 'Career',
      'WEALTHY': 'Finances', 'FINANCIALLY WISE': 'Finances', 'ABUNDANT': 'Finances',
      'PROSPEROUS': 'Finances', 'FINANCIALLY FREE': 'Finances',
      'LOVING': 'Relationships', 'CONNECTED': 'Relationships', 'SUPPORTIVE': 'Relationships',
      'COMPASSIONATE': 'Relationships', 'HARMONIOUS': 'Relationships',
      'SPIRITUAL': 'Spirituality', 'GROUNDED': 'Spirituality', 'PEACEFUL': 'Spirituality',
    };
    
    for (const identityName of allIdentityNames) {
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
        const category = identityCategories[identityName.toUpperCase()] || 'Mindset';
        const result = await supabase.from("identities").insert({
          name: identityName,
          emoji: identityEmojis[identityName] || '✨',
          user_id: userId,
          archetype_id: selectedArchetype.id,
          category: category,
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
  
  function addTemplateIdentity(identityName) {
    const emojiMap = {
      'HEALTHY': '💪', 'FIT': '🏃', 'STRONG': '💪', 'ENERGETIC': '⚡',
      'NOURISHED': '🥗', 'GROWTH': '🌱', 'MINDFUL': '🧠', 'FOCUSED': '🎯',
      'DISCIPLINED': '📏', 'GRATEFUL': '🙏', 'WEALTHY': '💎', 'FINANCIALLY WISE': '💰',
      'ABUNDANT': '🌟', 'RADIANT': '✨', 'BEAUTIFUL': '🌸', 'SUCCESSFUL': '🏆',
      'ACHIEVER': '🎯', 'DRIVEN': '🚀', 'LOVING': '❤️', 'CONNECTED': '🤝',
      'SPIRITUAL': '🧘‍♀️', 'PEACEFUL': '☮️', 'BALANCED': '⚖️', 'CONFIDENT': '💫',
    };
    const newIdentity = { name: identityName, emoji: emojiMap[identityName] || '✨' };
    setTemplateIdentities([...templateIdentities, newIdentity]);
  }
  
  function removeTemplateIdentity(index) {
    setTemplateIdentities(templateIdentities.filter((_, i) => i !== index));
  }
  
  function createNewIdentity() {
    const name = prompt("Enter new identity name:");
    if (name) {
      addTemplateIdentity(name.toUpperCase());
    }
  }

  async function addHabit(title, category) {
    const habitTitle = title || newTask;
    const habitCategory = category || taskCategory;
    
    if (!habitTitle?.trim()) return;
    
    const actualDay = taskDay === "Today" 
      ? new Date().toLocaleDateString('en-US', { weekday: 'long' })
      : taskDay;

    const page = (habitCategory === "Work" || habitCategory === "School") ? "work" : currentPage;
    
    const categoryIdents = categoryIdentities[habitCategory] || [];
    const mergedTags = [...new Set([...identityTags, ...categoryIdents])];

    try {
      const userId = session?.user?.id;
      
      const insertData = {
        title: habitTitle,
        category: habitCategory,
        page: page,
        archetype_id: activeArchetype?.id || null,
        day: actualDay,
        days: [actualDay],
        identity_tags: mergedTags,
        is_all_day: true,
        streak: 0,
      };
      
      if (userId) {
        insertData.user_id = userId;
      }
      
      const { data, error } = await supabase.from("tasks").insert(insertData).select();

      if (error) {
        alert('Error adding habit: ' + error.message);
      } else {
        setNewTask("");
        setTwoMinVersion("");
        setIdentityTags([]);
        setShowAddHabit(false);
        await loadData();
        setRefreshKey(k => k + 1);
      }
    } catch (e) { 
      console.log("Add habit error:", e); 
      alert("Error: " + e.message);
    }
  }

  async function saveUserName() {
    if (!session?.user?.id || !userName.trim()) return;
    await supabase.from('user_profiles').upsert({
      id: session.user.id,
      name: userName.trim(),
    }, { onConflict: 'id' });
    setShowProfileEdit(false);
  }

  async function toggleTask(id, completed, task = null, date = null, isTodo = false) {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const completionKey = `task_completed_${today}_${id}`;
      
      if (completed) {
        localStorage.removeItem(completionKey);
      } else {
        localStorage.setItem(completionKey, 'true');
        setLastCompletedType(isTodo ? 'todo' : 'habit');
        setShowGlowAnimation(true);
        // Auto-close after 3 seconds
        setTimeout(() => setShowGlowAnimation(false), 3000);
      }
      
      // Save daily average after toggling
      saveDailyAverage();
      
      // Force re-render to update scores from localStorage
      setRefreshKey(k => k + 1);
      
      // Update challenge refresh key to trigger challenge progress update
      setChallengeRefreshKey(k => k + 1);
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
  
  // Calculate today's glow score: +3 per habit, +1 per todo, +25 bonus for 100%
  const getGlowScore = () => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get today's habits
    const todayTasks = tasks.filter(t => {
      if (t.is_all_day) return true;
      const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
      return taskDays?.includes(todayName);
    });
    
    // Count completed habits
    const completedHabits = todayTasks.filter(t => 
      localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true'
    ).length;
    
    // Get today's todos
    const todayTodos = JSON.parse(localStorage.getItem(`dailyTodos_${todayISO}`) || '[]');
    const completedTodos = todayTodos.filter(t => t.completed).length;
    
    // Calculate base points: 3 per habit, 1 per todo
    let points = (completedHabits * 3) + completedTodos;
    
    // Bonus for completing all habits
    if (todayTasks.length > 0 && completedHabits === todayTasks.length) {
      points += 25;
    }
    
    return points;
  };
   
  // Get CUMULATIVE total glow points from signup to today
  const getTotalGlowPoints = () => {
    const accountStartDate = localStorage.getItem('accountStartDate');
    if (!accountStartDate) return 0;
    
    const startDate = new Date(accountStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let total = 0;
    
    // Loop through every day from signup to today
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get tasks for this day
      const dayTasks = tasks.filter(t => {
        if (t.is_all_day) return true;
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
        return taskDays?.includes(dayName);
      });
      
      if (dayTasks.length === 0) continue;
      
      // Count completed tasks
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      // Get todos
      const dayTodos = JSON.parse(localStorage.getItem(`dailyTodos_${dayStr}`) || '[]');
      const completedTodos = dayTodos.filter(t => t.completed).length;
      
      // Calculate points for this day
      let dayPoints = (completed * 3) + completedTodos;
      if (completed === dayTasks.length) dayPoints += 25;
      
      // Add any penalty for incomplete tasks from previous day
      const penalty = getDayPenalty(dayStr);
      dayPoints += penalty;
      
      total += dayPoints;
    }
    
    return total;
  };
  
  // Get streak - consecutive days with positive glow points
  const getStreak = () => {
    const accountStartDate = localStorage.getItem('accountStartDate');
    if (!accountStartDate) return 0;
    
    const startDate = new Date(accountStartDate);
    const today = new Date();
    
    let streak = 0;
    
    // Check from today backwards
    for (let d = new Date(today); d >= startDate; d.setDate(d.getDate() - 1)) {
      const dayStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get tasks for this day
      const dayTasks = tasks.filter(t => {
        if (t.is_all_day) return true;
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
        return taskDays?.includes(dayName);
      });
      
      if (dayTasks.length === 0) continue;
      
      // Check if all completed
      const completed = dayTasks.filter(t => 
        localStorage.getItem(`task_completed_${dayStr}_${t.id}`) === 'true'
      ).length;
      
      if (completed === dayTasks.length) {
        streak++;
      } else if (dayStr !== today.toISOString().split('T')[0]) {
        // Break if not today and not all completed
        break;
      }
    }
    
    return streak;
  };
  
  // Get weekly average glow points
  const getWeeklyAverage = () => {
    const history = JSON.parse(localStorage.getItem('glowPointsHistory') || '{}');
    const values = Object.values(history).slice(-7);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, v) => sum + v, 0);
    return Math.round(total / values.length);
  };
  
  // Share progress with accountability partner
  const shareWithPartner = () => {
    const today = new Date().toISOString().split('T')[0];
    const partnerId = localStorage.getItem('accountabilityPartner');
    if (!partnerId) return;
    
    const dailyAvg = getGlowScore();
    const streak = 0;
    const weeklyGlow = getWeeklyAverage ? getWeeklyAverage() : 0;
    const goals = JSON.parse(localStorage.getItem('longTermGoals') || '[]');
    
    const progressData = {
      [today]: dailyAvg,
      streak: streak,
      weeklyGlow: weeklyGlow,
      goals: goals,
      lastUpdated: new Date().toISOString()
    };
    
    // Store locally for demo (in production, would sync to Supabase)
    localStorage.setItem(`partnerProgress_${session?.user?.id}`, JSON.stringify(progressData));
  };
  
  // Share data when page loads and on changes
  useEffect(() => {
    if (session?.user?.id) {
      shareWithPartner();
    }
  }, [tasks, completionLogs]);

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
    // Remove identity locally only - keeps it in the app for other users
    setIdentities(prev => prev.filter(identity => identity.id !== id));
  }
  
  // Daily To-do functions
  const saveTodos = (updatedTodos) => {
    const today = new Date().toISOString().split('T')[0];
    setTodos(updatedTodos);
    localStorage.setItem(`dailyTodos_${today}`, JSON.stringify(updatedTodos));
  };
  
  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = {
      id: Date.now(),
      title: newTodo,
      category: todoCategory,
      completed: false,
      createdAt: new Date().toISOString()
    };
    saveTodos([...todos, todo]);
    setNewTodo("");
  };
  
  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    const updatedTodos = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updatedTodos);
    
    // Show glow animation when completing a todo
    if (todo && !todo.completed) {
      setLastCompletedType('todo');
      setShowGlowAnimation(true);
      setTimeout(() => setShowGlowAnimation(false), 3000);
    }
  };
  
  const deleteTodo = (id) => {
    const confirmed = confirm('Delete this task?');
    if (!confirmed) return;
    saveTodos(todos.filter(t => t.id !== id));
  };

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
    const userId = session?.user?.id;
    if (!userId) return;
    if (!newIdentityName.trim()) {
      alert("Please enter an archetype name");
      return;
    }
    
    const { data, error } = await supabase.from("archetypes").insert({
      name: newIdentityName,
      emoji: newIdentityEmoji,
      description: "Custom archetype created by user",
      default_identities: [newIdentityName],
      template_habits: [],
      user_id: userId,
    }).select().single();
    
    if (error) {
      console.error("Archetype error:", error);
      alert("Error creating archetype: " + error.message);
      return;
    }
    
    // Clear the form
    setNewIdentityName("");
    setNewIdentityEmoji("✨");
    
    // Set as active archetype and go to template editor
    if (data) {
      setSelectedArchetype(data);
      setActiveArchetype(data);
      localStorage.setItem('activeArchetype', JSON.stringify(data));
      setOnboardingStep('template');
      setTemplateHabits([]);
      setTemplateIdentities([]);
    }
    
    loadData();
  }
  
  async function deleteUserArchetype(archetype) {
    const confirmed = confirm(`Delete "${archetype.name}"? This cannot be undone.`);
    if (!confirmed) return;
    
    // Delete from Supabase
    await supabase.from("archetypes").delete().eq("id", archetype.id);
    
    // Remove from adopted archetypes
    const updatedAdopted = adoptedArchetypes.filter(a => a.id !== archetype.id);
    setAdoptedArchetypes(updatedAdopted);
    localStorage.setItem('adoptedArchetypes', JSON.stringify(updatedAdopted));
    
    // Clear active archetype if it was this one
    if (activeArchetype?.id === archetype.id) {
      setActiveArchetype(null);
      localStorage.removeItem('activeArchetype');
    }
    
    loadData();
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
    
    if (!showAllTasks) {
      if (!activeArchetype) {
        const adoptedIds = adoptedArchetypes.map(a => a.id);
        return filtered.filter(t => !t.archetype_id || adoptedIds.includes(t.archetype_id));
      }
      filtered = filtered.filter(t => t.archetype_id === activeArchetype.id);
    } else {
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
            // Set default identities from archetype
            if (arch.default_identities && arch.default_identities.length > 0) {
              setTemplateIdentities(arch.default_identities.map(name => ({ name, emoji: '✨' })));
            } else {
              setTemplateIdentities([]);
            }
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
          identities={templateIdentities}
          onAddIdentity={addTemplateIdentity}
          onRemoveIdentity={removeTemplateIdentity}
          onCreateIdentity={createNewIdentity}
        />
      )}

      {!onboardingStep && (
        <>
      <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>✿</button>
      
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
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
            <p className="settings-hint">Choose from available templates</p>
            <div className="archetype-switcher">
              {archetypes
                .filter(arch => !arch.user_id && !adoptedArchetypes.find(a => a.id === arch.id))
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
            <h3>My Custom Archetypes</h3>
            <p className="settings-hint">Archetypes you created</p>
            <div className="archetype-switcher">
              {archetypes
                .filter(arch => arch.user_id === session?.user?.id)
                .map(arch => (
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
                        deleteUserArchetype(arch);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>My Identities</h3>
            <p className="settings-hint">
              {activeArchetype 
                ? `Identities for ${activeArchetype.name}` 
                : adoptedArchetypes.length > 0 
                  ? 'All adopted identities' 
                  : 'Select an archetype to view identities'
              }
            </p>
            {adoptedArchetypes.length === 0 ? (
              <p className="empty-message">Adopt an archetype to see identities</p>
            ) : (
              <div className="identity-list">
                {(() => {
                  // Show identities from active archetype, OR all adopted if none selected
                  let filteredIdentities = identities;
                  if (activeArchetype) {
                    filteredIdentities = identities.filter(id => id.archetype_id === activeArchetype.id);
                  } else {
                    const adoptedIds = adoptedArchetypes.map(a => a.id);
                    filteredIdentities = identities.filter(id => adoptedIds.includes(id.archetype_id));
                  }
                  
                  // Remove duplicates based on name
                  const seen = new Set();
                  filteredIdentities = filteredIdentities.filter(id => {
                    const key = id.name?.toUpperCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                  
                  return filteredIdentities.length > 0 ? (
                    filteredIdentities.map(id => (
                      <div key={id.id} className="identity-list-item">
                        <span>{getIdentityEmoji(id)} {id.name}</span>
                        <span className="identity-score">{getIdentityScore(id.id) || 0} pts</span>
                        <button 
                          className="identity-delete-btn"
                          onClick={() => deleteIdentity(id.id)}
                          title="Remove this identity"
                        >×</button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-message">No identities yet</p>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>Category Identities</h3>
            <p className="settings-hint">Tap a category to edit linked identities</p>
            <div className="category-chips-grid">
              {categoriesList.map(cat => (
                <button 
                  key={cat}
                  className="category-chip-btn"
                  onClick={() => setEditingCategoryIdentities(cat)}
                >
                  <span className="chip-label">{cat}</span>
                  <span className="chip-count">{(categoryIdentities[cat] || []).length} identities</span>
                </button>
              ))}
            </div>
          </div>
          
          {editingCategoryIdentities && (
            <div className="modal-overlay" onClick={() => setEditingCategoryIdentities(null)}>
              <div className="modal identity-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingCategoryIdentities}</h2>
                  <button onClick={() => setEditingCategoryIdentities(null)}>×</button>
                </div>
                <div className="modal-content identity-picker-content">
                  <p className="modal-hint">Tap identities to link with this category:</p>
                  <div className="identity-all-list">
                    {(() => {
                      const selectedIds = categoryIdentities[editingCategoryIdentities] || [];
                      const sortedIdentities = [...allPossibleIdentities].sort((a, b) => {
                        const aSelected = selectedIds.includes(a);
                        const bSelected = selectedIds.includes(b);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        return 0;
                      });
                      return sortedIdentities.map(idName => {
                        const isSelected = selectedIds.includes(idName);
                        return (
                          <button 
                            key={idName}
                            className={`identity-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              const current = categoryIdentities[editingCategoryIdentities] || [];
                              const updated = isSelected
                                ? current.filter(n => n !== idName)
                                : [...current, idName];
                              setCategoryIdentities({
                                ...categoryIdentities,
                                [editingCategoryIdentities]: updated
                              });
                            }}
                          >
                            {getIdentityEmoji({ name: idName, emoji: null })} {idName}
                            {isSelected && <span className="pill-check">✓</span>}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <button 
                    className="button" 
                    onClick={() => {
                      localStorage.setItem('categoryIdentities', JSON.stringify(categoryIdentities));
                      setEditingCategoryIdentities(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h3>Custom Categories</h3>
            <p className="settings-hint">Add your own categories (only visible to you)</p>
            {customCategories.length > 0 && (
              <div className="custom-category-list">
                {customCategories.map(cat => (
                  <div key={cat} className="custom-category-item">
                    <span>{cat}</span>
                    <button 
                      className="custom-cat-delete"
                      onClick={() => deleteCustomCategory(cat)}
                      title="Delete category"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            {showAddCategory ? (
              <div className="add-category-form">
                <input
                  className="input"
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                <button className="button" onClick={addCustomCategory}>Add</button>
                <button className="button secondary" onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}>Cancel</button>
              </div>
            ) : (
              <button className="button" onClick={() => setShowAddCategory(true)}>
                + Add Category
              </button>
            )}
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
                  <span className="how-icon">📝</span>
                  <h4>Daily To-Do List</h4>
                  <p>Add quick tasks for the day that reset at midnight. These factor into your glow score!</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">✨</span>
                  <h4>Glow Score Points</h4>
                  <p>Earn +3 points per habit completed, +1 per todo, and a +25 bonus when you complete 100% of your daily habits!</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">📊</span>
                  <h4>Today's Glow</h4>
                  <p>Track your daily progress as a percentage - complete more habits to increase your glow!</p>
                </div>
                
                <div className="how-item">
                  <span className="how-icon">👥</span>
                  <h4>Accountability Partner</h4>
                  <p>Connect with friends in the community to share progress, motivate each other, and stay on track together!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Glow Score */}
      {!minimizeGlow ? (
        <div className="floating-glow">
          <button className="floating-glow-minimize" onClick={() => setMinimizeGlow(true)}>×</button>
          <div className="floating-glow-content">
            <span className="floating-glow-score">{getGlowScore()}</span>
            <span className="floating-glow-label">Glow</span>
          </div>
        </div>
      ) : (
        <button className="glow-restore-btn" onClick={() => setMinimizeGlow(false)}>✨</button>
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
        <button 
          className="nav-btn"
          onClick={() => setShowProfileEdit(true)}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>

      {/* Glow Animation Overlay */}
      {showGlowAnimation && (
        <div className="glow-overlay" onClick={() => setShowGlowAnimation(false)}>
          <div className="sparkles"></div>
          <button className="glow-close-btn" onClick={(e) => { e.stopPropagation(); setShowGlowAnimation(false); }}>×</button>
          <div className="glow-burst">✨</div>
          <div className="glow-message">You're on a glow! ✨</div>
          <div className="glow-points-added">+{lastCompletedType === 'todo' ? '1' : '3'}</div>
        </div>
      )}

      {/* Daily Recap Popup */}
      {showDailyRecap && (
        <div className="daily-recap-overlay" onClick={() => setShowDailyRecap(false)}>
          <div className="daily-recap-card" onClick={e => e.stopPropagation()}>
            <div className="recap-sparkles">
              <span className="sparkle sparkle-1">✨</span>
              <span className="sparkle sparkle-2">✨</span>
              <span className="sparkle sparkle-3">✨</span>
            </div>
            <div className="recap-header">
              <h2>🌅 Yesterday's Glow</h2>
              <p className="recap-subtitle">Here's how you did!</p>
            </div>
            <div className="recap-stats">
              <div className="recap-stat earned">
                <span className="stat-icon">🎯</span>
                <span className="stat-label">Points Earned</span>
                <span className="stat-value">+{recapData.earned}</span>
              </div>
              {recapData.penalty > 0 && (
                <div className="recap-stat penalty">
                  <span className="stat-icon">💭</span>
                  <span className="stat-label">Incomplete Tasks</span>
                  <span className="stat-value">-{recapData.penalty}</span>
                </div>
              )}
              <div className="recap-divider"></div>
              <div className="recap-total">
                <span className="total-label">Net Points</span>
                <span className={`total-value ${recapData.total >= 0 ? 'positive' : 'negative'}`}>
                  {recapData.total >= 0 ? '+' : ''}{recapData.total}
                </span>
              </div>
            </div>
            <div className="recap-message">
              {recapData.total > 20 && "🌟 Amazing day! You're on fire!"}
              {recapData.total > 0 && recapData.total <= 20 && "💪 Great job! Keep it up!"}
              {recapData.total === 0 && "🌱 Every day is a fresh start!"}
              {recapData.total < 0 && "🌙 Tomorrow is a new opportunity!"}
            </div>
            <button 
              className="recap-close-btn"
              onClick={() => setShowDailyRecap(false)}
            >
              Let's Glow Today! ✨
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay" onClick={() => setShowProfileEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button onClick={() => setShowProfileEdit(false)}>×</button>
            </div>
            <div className="modal-content">
              <label>Your Name (seen by friends)</label>
              <input
                className="input"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              <button className="button" onClick={saveUserName}>Save</button>
            </div>
          </div>
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
          todos={todos}
          onAddTodo={addTodo}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          todoCategory={todoCategory}
          setTodoCategory={setTodoCategory}
          getGlowScore={getGlowScore}
          showTodoList={showTodoList}
          setShowTodoList={setShowTodoList}
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
          activeArchetype={activeArchetype}
          adoptedArchetypes={adoptedArchetypes}
          getIdentityEmoji={getIdentityEmoji}
        />
      )}

      {currentPage === "community" && (
        <CommunityPage session={session} tasks={tasks} challengeRefreshKey={challengeRefreshKey} />
      )}
      </>
      )}
      </div>
  );
}

// Home Page Component
function HomePage({ tasks, activeArchetype, identities, completionLogs, onToggleTask, onDeleteTask, onEditTask, categoriesList = ["Health", "Mindset", "Finances", "Beauty"], refreshKey, todos = [], onAddTodo, onToggleTodo, onDeleteTodo, newTodo, setNewTodo, todoCategory, setTodoCategory, showTodoList, setShowTodoList, getGlowScore }) {
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
    const usedCategories = new Set([
      ...tasks.map(t => t.category).filter(Boolean),
      ...todos.map(t => t.category).filter(Boolean)
    ]);
    return categoriesList.filter(c => usedCategories.has(c));
  };

  // Get todo progress for a category
  const getTodoProgress = (category) => {
    const categoryTodos = todos.filter(t => t.category === category);
    if (categoryTodos.length === 0) return null;
    const completed = categoryTodos.filter(t => t.completed).length;
    return Math.round((completed / categoryTodos.length) * 100);
  };

  // Today's Glow - average percentage of habits completed (not todos)
  const getTodaysGlow = () => {
    if (todayTasks.length === 0) return 0;
    const completed = todayTasks.filter(t => completedIds.has(t.id)).length;
    return Math.round((completed / todayTasks.length) * 100);
  };

  // Glow score is average of ALL used categories (including todos)
  const glowScore = () => {
    const usedCategories = getUsedCategories();
    if (usedCategories.length === 0) return 0;
    const progress = usedCategories.map(c => {
      const taskProgress = getCategoryProgress(c);
      const todoProgress = getTodoProgress(c);
      if (todoProgress === null) return taskProgress;
      if (taskProgress === 0) return todoProgress;
      return Math.round((taskProgress + todoProgress) / 2);
    });
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
  const dailyAvg = getTodaysGlow();
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

      {/* Today's To-Do List Section */}
      <div className="home-section daily-todo-section">
        <div className="todo-header" onClick={() => setShowTodoList(!showTodoList)}>
          <h2>Today's To-Do List</h2>
          <span className="todo-toggle">{showTodoList ? '▼' : '▶'}</span>
        </div>
        
        {showTodoList && (
          <>
            <div className="todo-add-form">
              <input
                className="input todo-input"
                placeholder="Add a task..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onAddTodo()}
              />
              <select
                className="input todo-category-select"
                value={todoCategory}
                onChange={(e) => setTodoCategory(e.target.value)}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="button todo-add-btn" onClick={onAddTodo}>+</button>
            </div>
            
            {todos.length === 0 ? (
              <p className="empty-message">No tasks for today</p>
            ) : (
              <div className="todo-list">
                {todos.map(todo => (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <div 
                      className="todo-checkbox"
                      onClick={() => onToggleTodo(todo.id)}
                    >
                      <span className="checkbox-emoji">{todo.completed ? '✓' : '○'}</span>
                      <span className="todo-text">{todo.title}</span>
                    </div>
                    <div className="todo-actions">
                      <span className="todo-category-tag">{todo.category}</span>
                      <button className="delete-btn" onClick={() => onDeleteTodo(todo.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Growth Page Component
function GrowthPage({ identities, tasks, completionLogs, categoriesList, activeArchetype, adoptedArchetypes, getIdentityEmoji }) {
  let displayIdentities = identities;
  
  if (activeArchetype) {
    displayIdentities = identities.filter(id => id.archetype_id === activeArchetype.id);
  } else if (adoptedArchetypes?.length > 0) {
    const adoptedIds = adoptedArchetypes.map(a => a.id);
    displayIdentities = identities.filter(id => adoptedIds.includes(id.archetype_id));
  } else {
    displayIdentities = [];
  }
  
  const seen = new Set();
  displayIdentities = displayIdentities.filter(id => {
    const key = id.name?.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('longTermGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Health', timeframe: '3m' });
  const [editingGoal, setEditingGoal] = useState(null);

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
    const confirmed = confirm('Delete this goal?');
    if (!confirmed) return;
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem('longTermGoals', JSON.stringify(updatedGoals));
  };

  const saveGoalEdit = (goalId, field, value) => {
    const updatedGoals = goals.map(g => 
      g.id === goalId ? { ...g, [field]: value } : g
    );
    setGoals(updatedGoals);
    localStorage.setItem('longTermGoals', JSON.stringify(updatedGoals));
  };

  const getIdentityProgress = (identityId, identityName) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const completedWithIdentity = tasks.filter(t => {
      if (t.is_all_day) return true;
      const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days;
      if (!taskDays?.includes(todayName)) return false;
      return localStorage.getItem(`task_completed_${todayISO}_${t.id}`) === 'true';
    }).filter(t => {
      const tags = t.identity_tags || [];
      return tags.some(tag => {
        if (typeof tag === 'string') {
          return tag === identityId || tag.toUpperCase().includes(identityName?.toUpperCase());
        }
        return tag === identityId || tag.name?.toUpperCase().includes(identityName?.toUpperCase());
      });
    });
    
    return completedWithIdentity.length;
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
                {editingGoal === goal.id ? (
                  <div className="goal-edit-form">
                    <input
                      className="input"
                      value={goal.title}
                      onChange={(e) => saveGoalEdit(goal.id, 'title', e.target.value)}
                      placeholder="Goal title"
                    />
                    <select
                      className="input"
                      value={goal.category}
                      onChange={(e) => saveGoalEdit(goal.id, 'category', e.target.value)}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      className="input"
                      value={goal.timeframe}
                      onChange={(e) => saveGoalEdit(goal.id, 'timeframe', e.target.value)}
                    >
                      {timeframes.map(tf => (
                        <option key={tf.value} value={tf.value}>{tf.label}</option>
                      ))}
                    </select>
                    <button className="button" onClick={() => setEditingGoal(null)}>Done</button>
                  </div>
                ) : (
                  <div className="goal-view">
                    <div className="goal-info">
                      <span className="goal-category">{goal.category}</span>
                      <span className="goal-timeframe">{goal.timeframe}</span>
                    </div>
                    <div className="goal-actions">
                      <button className="goal-edit-btn" onClick={() => setEditingGoal(goal.id)}>Edit</button>
                      <button className="goal-delete-btn" onClick={() => deleteGoal(goal.id)}>×</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="growth-section">
        <h2>Identity Development</h2>
        <p className="section-hint">Your growth across identity traits</p>
        
        {displayIdentities.length === 0 ? (
          <p className="empty-message">
            {activeArchetype 
              ? `No identities for ${activeArchetype.name} yet` 
              : 'Select an archetype to see identities'}
          </p>
        ) : (
          <div className="identities-progress">
            {displayIdentities.map(id => {
              const progress = getIdentityProgress(id.id, id.name);
              return (
                <div key={id.id} className="identity-progress-item">
                  <div className="identity-info">
                    <span className="identity-emoji">{getIdentityEmoji(id)}</span>
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
function CommunityPage({ session, tasks = [], challengeRefreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showJoinChallenge, setShowJoinChallenge] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState({});
  const [selectedChallengeDetail, setSelectedChallengeDetail] = useState(null);
  
  // Challenge keywords - what habits each challenge tracks
  const challengeKeywords = {
    'Hydration Goddess': ['drink', 'water', 'hydrate', 'hydration', 'h2o', 'fluids', 'bottle', 'glass of water'],
    'Mindful Mornings': ['meditate', 'meditation', 'mindful', 'breath', 'breathing', 'prayer', 'gratitude', 'morning routine'],
    'Fitness Glow': ['exercise', 'workout', 'gym', 'run', 'yoga', 'fitness', 'walk', 'stretch', 'training', 'cardio', 'weights'],
    'Financial Glow': ['budget', 'save', 'saving', 'money', 'finance', 'invest', 'expense', 'track spending', 'financial'],
    'Sleep Champion': ['sleep', 'bed', 'rest', 'night', 'sleeping', 'nap', 'snooze', 'tired'],
    'Healthy Eating': ['eat', 'meal', 'food', 'veggies', 'vegetables', 'fruit', 'healthy', 'nutrition', 'diet', 'breakfast', 'lunch', 'dinner'],
    'Digital Detox': ['phone', 'screen', 'social media', 'digital', 'device', 'unplug', 'no phone'],
    'Step Master': ['walk', 'steps', 'step', 'hike', 'stairs', 'steps'],
    'No Sugar': ['sugar', 'candy', 'sweet', 'dessert', 'chocolate', 'ice cream'],
    'Self Care': ['self care', 'self-care', 'skincare', 'bath', 'spa', 'pamper', 'relax', 'treat yourself'],
    'Journal Queen': ['journal', 'write', 'writing', 'diary', 'gratitude list', 'reflect']
  };
  
  // Challenge duration in days
  const challengeDurations = {
    '7-Day Glow': 7,
    '30-Day Glow Up': 30,
    'Hydration Goddess': 7,
    'Mindful Mornings': 7,
    'Fitness Glow': 14,
    'Financial Glow': 30,
    'Sleep Champion': 14,
    'Healthy Eating': 14,
    'Digital Detox': 7,
    'Step Master': 14,
    'No Sugar': 7,
    'Self Care': 7,
    'Journal Queen': 14
  };
  
  // Calculate days completed for streak challenges (7-Day, 30-Day)
  const calculateDaysCompleted = (durationDays) => {
    const completedDays = [];
    const today = new Date();
    
    for (let i = 0; i < durationDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get habits for this day
      const dayTasks = tasks.filter(t => {
        if (t.is_all_day) return true;
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
        return taskDays.includes(dayName);
      });
      
      if (dayTasks.length === 0) continue;
      
      // Check if ALL habits completed
      const allCompleted = dayTasks.every(t => 
        localStorage.getItem(`task_completed_${dateStr}_${t.id}`) === 'true'
      );
      
      if (allCompleted) {
        completedDays.push(dateStr);
      }
    }
    
    return completedDays.length;
  };
  
  // Calculate days completed for keyword-based challenges
  const calculateKeywordDaysCompleted = (keywords, durationDays) => {
    const completedDays = [];
    const today = new Date();
    
    for (let i = 0; i < durationDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Get matching habits for this day
      const dayTasks = tasks.filter(t => {
        if (!t.is_all_day) {
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
          if (!taskDays.includes(dayName)) return false;
        }
        if (keywords.length === 0) return false;
        const titleLower = (t.title || '').toLowerCase();
        return keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
      });
      
      if (dayTasks.length === 0) continue;
      
      // Check if ALL matching habits completed
      const allCompleted = dayTasks.every(t => 
        localStorage.getItem(`task_completed_${dateStr}_${t.id}`) === 'true'
      );
      
      if (allCompleted) {
        completedDays.push(dateStr);
      }
    }
    
    return completedDays.length;
  };
  
  // Calculate challenge progress
  const calculateChallengeProgress = (challengeTitle) => {
    const today = new Date().toISOString().split('T')[0];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const keywords = challengeKeywords[challengeTitle] || [];
    const duration = challengeDurations[challengeTitle] || 7;
    
    // Handle 7-Day and 30-Day Glow challenges
    if (challengeTitle === '7-Day Glow' || challengeTitle === '30-Day Glow Up') {
      const daysCompleted = calculateDaysCompleted(duration);
      
      return {
        daysCompleted,
        totalDays: duration,
        percentage: Math.round((daysCompleted / duration) * 100),
        isStreakChallenge: true
      };
    }
    
    // Keyword-based challenges (Hydration, Mindful, etc.)
    const matchingHabits = tasks.filter(t => {
      // Check if habit is for today
      if (!t.is_all_day) {
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
        if (!taskDays.includes(todayName)) return false;
      }
      
      // Check keyword match
      if (keywords.length === 0) return false;
      const titleLower = (t.title || '').toLowerCase();
      return keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
    });
    
    if (matchingHabits.length === 0) return null;
    
    const completedCount = matchingHabits.filter(t => 
      localStorage.getItem(`task_completed_${today}_${t.id}`) === 'true'
    ).length;
    
    // Calculate days completed for keyword-based challenges
    const daysCompleted = calculateKeywordDaysCompleted(keywords, duration);
    
    return {
      total: matchingHabits.length,
      completed: completedCount,
      percentage: Math.round((completedCount / matchingHabits.length) * 100),
      daysCompleted,
      totalDays: duration,
      isStreakChallenge: false
    };
  };
  
  // Get detailed challenge info including matching habits
  const getChallengeDetails = (challenge) => {
    const today = new Date().toISOString().split('T')[0];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const keywords = challengeKeywords[challenge.title] || [];
    const isStreak = challenge.title === '7-Day Glow' || challenge.title === '30-Day Glow Up';
    const duration = challengeDurations[challenge.title] || challenge.duration_days || 7;
    
    // Get matching habits for today
    const matchingHabits = keywords.length > 0 
      ? tasks.filter(t => {
          if (!t.is_all_day) {
            const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
            if (!taskDays.includes(todayName)) return false;
          }
          const titleLower = (t.title || '').toLowerCase();
          return keywords.some(k => titleLower.includes(k.toLowerCase()));
        })
      : [];
    
    // Calculate daily completion
    let todayCompletion = 0;
    let todayTotal = 0;
    
    if (isStreak) {
      // For streak challenges, count all tasks
      const allTasks = tasks.filter(t => {
        if (t.is_all_day) return true;
        const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
        return taskDays.includes(todayName);
      });
      todayTotal = allTasks.length;
      todayCompletion = allTasks.filter(t => 
        localStorage.getItem(`task_completed_${today}_${t.id}`) === 'true'
      ).length;
    } else if (keywords.length > 0) {
      todayTotal = matchingHabits.length;
      todayCompletion = matchingHabits.filter(t => 
        localStorage.getItem(`task_completed_${today}_${t.id}`) === 'true'
      ).length;
    }
    
    // Calculate day-by-day progress
    const dayHistory = [];
    for (let i = 0; i < duration; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      let dayTotal = 0;
      let dayCompleted = 0;
      
      if (isStreak) {
        // For streak challenges, count all tasks
        const dayTasks = tasks.filter(t => {
          if (t.is_all_day) return true;
          const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
          return taskDays.includes(dayName);
        });
        dayTotal = dayTasks.length;
        dayCompleted = dayTasks.filter(t => 
          localStorage.getItem(`task_completed_${dateStr}_${t.id}`) === 'true'
        ).length;
      } else if (keywords.length > 0) {
        // For keyword-based challenges, count only matching tasks
        const dayTasks = tasks.filter(t => {
          if (!t.is_all_day) {
            const taskDays = typeof t.days === 'string' ? JSON.parse(t.days) : t.days || [];
            if (!taskDays.includes(dayName)) return false;
          }
          const titleLower = (t.title || '').toLowerCase();
          return keywords.some(k => titleLower.includes(k.toLowerCase()));
        });
        dayTotal = dayTasks.length;
        dayCompleted = dayTasks.filter(t => 
          localStorage.getItem(`task_completed_${dateStr}_${t.id}`) === 'true'
        ).length;
      }
      
      dayHistory.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        total: dayTotal,
        completed: dayCompleted,
        percentage: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0,
        isToday: i === 0
      });
    }
    
    return {
      keywords,
      isStreak,
      duration,
      matchingHabits,
      todayCompletion,
      todayTotal,
      dayHistory,
      daysCompleted: challengeProgress[challenge.id]?.daysCompleted || 0
    };
  };
  
  // Update challenge progress when tasks change or when refresh is triggered
  useEffect(() => {
    const updateProgress = () => {
      const progress = {};
      challenges.forEach(c => {
        const result = calculateChallengeProgress(c.title);
        if (result !== null) {
          progress[c.id] = result;
        }
      });
      setChallengeProgress(progress);
    };
    
    updateProgress();
  }, [tasks, challenges, challengeRefreshKey]);
  
  // Debug: log challenge progress when it changes
  useEffect(() => {
    console.log('Challenge Progress Updated:', challengeProgress);
  }, [challengeProgress]);
  
  // Accountability partners state (multiple)
  const [accountabilityPartners, setAccountabilityPartners] = useState(() => {
    const saved = localStorage.getItem('accountabilityPartners');
    return saved ? JSON.parse(saved) : [];
  });
  const [partnersData, setPartnersData] = useState({});
  const [showPartnerSelect, setShowPartnerSelect] = useState(false);
  
  // Accountability groups
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  
  // Share settings
  const [shareSettings, setShareSettings] = useState(() => {
    const saved = localStorage.getItem('shareSettings');
    return saved ? JSON.parse(saved) : {
      dailyProgress: true,
      glowScores: true,
      streakStatus: true,
      longTermGoals: true,
      challengeProgress: true
    };
  });
  
  // Nudges
  const [nudges, setNudges] = useState([]);
  const [nudgeCount, setNudgeCount] = useState(0);
  
  // Friend glow scores
  const [friendGlowScores, setFriendGlowScores] = useState({});

  // Auto-refresh for real-time updates
  useEffect(() => {
    loadFriends();
    loadChallenges();
    loadLeaderboard();
    loadNudges();
    
    const refreshInterval = setInterval(() => {
      loadFriends();
      loadNudges();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Load partner data when partners change
  useEffect(() => {
    accountabilityPartners.forEach(partnerId => {
      loadPartnerData(partnerId);
    });
  }, [accountabilityPartners]);

  async function loadPartnerData(partnerId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', partnerId)
      .single();
    
    if (profile) {
      const today = new Date().toISOString().split('T')[0];
      const partnerProgress = JSON.parse(localStorage.getItem(`partnerProgress_${partnerId}`) || '{}');
      setPartnersData(prev => ({
        ...prev,
        [partnerId]: {
          ...profile,
          todayProgress: partnerProgress[today] || 0,
          streak: partnerProgress.streak || 0,
          weeklyGlow: partnerProgress.weeklyGlow || 0,
          goals: partnerProgress.goals || [],
          lastActive: partnerProgress.lastActive || null
        }
      }));
    }
  }

  async function loadNudges() {
    if (!session?.user?.id) return;
    
    const { data: receivedNudges } = await supabase
      .from('nudges')
      .select('*')
      .eq('to_user_id', session.user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });
    
    if (receivedNudges?.length) {
      setNudgeCount(receivedNudges.length);
      setNudges(receivedNudges);
    }
  }

  async function sendNudge(toUserId) {
    if (!session?.user?.id) return;
    
    await supabase.from('nudges').insert({
      from_user_id: session.user.id,
      to_user_id: toUserId,
      type: 'nudge',
      read: false
    });
    
    alert('Nudge sent! 👋');
  }

  async function clearNudge(nudgeId) {
    await supabase.from('nudges').update({ read: true }).eq('id', nudgeId);
    loadNudges();
  }

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
      
      // Load glow scores for friends
      const scores = {};
      profiles?.forEach(profile => {
        const progress = JSON.parse(localStorage.getItem(`partnerProgress_${profile.id}`) || '{}');
        const today = new Date().toISOString().split('T')[0];
        scores[profile.id] = {
          todayProgress: progress[today] || 0,
          streak: progress.streak || 0,
          weeklyGlow: progress.weeklyGlow || 0
        };
      });
      setFriendGlowScores(scores);
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
    
    const searchTerm = friendEmail.trim().toLowerCase();
    console.log("=== FRIEND REQUEST DEBUG ===");
    console.log("Search term:", searchTerm);
    console.log("Current user ID:", session.user.id);
    
    // First, let's see what's in user_profiles
    console.log("Fetching all user_profiles...");
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*');
    
    console.log("All profiles:", JSON.stringify(allProfiles, null, 2));
    console.log("Error:", allError);
    
    // Try to find user by email in user_profiles
    console.log("Searching with ilike...");
    let { data: profiles, error: searchError } = await supabase
      .from('user_profiles')
      .select('id, email, name')
      .or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(5);
    
    console.log("Search results:", profiles);
    console.log("Search error:", searchError);
    
    // If no match found, show all available profiles for debugging
    if (!profiles || profiles.length === 0) {
      console.log("DEBUG: Available profiles for friend lookup:", allProfiles);
      alert('No user found. Make sure your friend has logged in at least once. Ask them to refresh the app.');
      return;
    }
    
    // Use the first match
    const friendId = profiles[0].id;
    const friendEmail2 = profiles[0].email || profiles[0].name;
    console.log("Found friend:", friendId, friendEmail2);
    
    if (friendId === session.user.id) {
      alert("You can't add yourself as a friend!");
      return;
    }
    
    // Check if already friends or request pending
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`)
      .maybeSingle();
    
    if (existing) {
      alert('Already friends or request pending!');
      return;
    }
    
    // Send friend request
    const { error: insertError } = await supabase.from('friends').insert({
      user_id: session.user.id,
      friend_id: friendId,
      status: 'pending'
    });
    
    if (insertError) {
      console.error('Friend request error:', insertError);
      alert('Error sending friend request');
    } else {
      alert('Friend request sent!');
      loadFriends();
    }
    
    setFriendEmail('');
  }

  async function acceptFriendRequest(requesterId) {
    if (!session?.user?.id) return;
    
    // Update the pending request to accepted
    await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('friend_id', session.user.id)
      .eq('user_id', requesterId);
    
    // Create reciprocal friendship
    await supabase.from('friends').insert({
      user_id: session.user.id,
      friend_id: requesterId,
      status: 'accepted'
    });
    
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

  const togglePartner = (friendId) => {
    const isPartner = accountabilityPartners.includes(friendId);
    const updated = isPartner 
      ? accountabilityPartners.filter(id => id !== friendId)
      : [...accountabilityPartners, friendId];
    setAccountabilityPartners(updated);
    localStorage.setItem('accountabilityPartners', JSON.stringify(updated));
  };

  const createGroup = () => {
    if (!newGroupName.trim() || selectedGroupMembers.length < 2) {
      alert('Please enter a group name and select at least 2 members');
      return;
    }
    const newGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
      members: [session.user.id, ...selectedGroupMembers],
      createdAt: new Date().toISOString()
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('accountabilityGroups', JSON.stringify(updatedGroups));
    setNewGroupName('');
    setSelectedGroupMembers([]);
    setShowCreateGroup(false);
  };

  const deleteGroup = (groupId) => {
    if (!confirm('Delete this group?')) return;
    const updated = groups.filter(g => g.id !== groupId);
    setGroups(updated);
    localStorage.setItem('accountabilityGroups', JSON.stringify(updated));
  };

  const toggleGroupMember = (friendId) => {
    const isSelected = selectedGroupMembers.includes(friendId);
    setSelectedGroupMembers(
      isSelected 
        ? selectedGroupMembers.filter(id => id !== friendId)
        : [...selectedGroupMembers, friendId]
    );
  };

  const updateShareSetting = (key) => {
    const updated = { ...shareSettings, [key]: !shareSettings[key] };
    setShareSettings(updated);
    localStorage.setItem('shareSettings', JSON.stringify(updated));
  };

  const nudgePartner = (partnerId) => {
    sendNudge(partnerId);
  };

  return (
    <div className="community-page">
      <h1 className="title">Glow Community ✧</h1>
      
      {/* Nudge notification banner */}
      {nudgeCount > 0 && (
        <div className="nudge-banner">
          <span>👋 You have {nudgeCount} nudge{nudgeCount > 1 ? 's' : ''} waiting!</span>
          <button onClick={() => setNudges([])}>View</button>
        </div>
      )}
      
      <div className="community-tabs">
        <span 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >Friends</span>
        <span 
          className={`tab ${activeTab === 'accountability' ? 'active' : ''}`}
          onClick={() => setActiveTab('accountability')}
        >
          Accountability
          {accountabilityPartners.length > 0 && (
            <span className="tab-badge">{accountabilityPartners.length}</span>
          )}
        </span>
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
          <div className="friends-header">
            <div className="add-friend-form">
              <input
                className="input"
                type="text"
                name="friendEmail"
                id="friendEmail"
                autoComplete="off"
                placeholder="Search by email or name..."
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
              <button type="button" className="button" onClick={sendFriendRequest}>Add</button>
            </div>
          </div>
          
          {friendRequests.length > 0 && (
            <div className="friend-requests-section">
              <h3>📩 Friend Requests</h3>
              <div className="requests-grid">
                {friendRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <span className="request-avatar">{req.emoji || '👤'}</span>
                    <div className="request-info">
                      <span className="request-name">{req.name || req.email || 'Someone'}</span>
                    </div>
                    <button className="button small accept-btn" onClick={() => acceptFriendRequest(req.id)}>Accept</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <h2>Your Glow Squad</h2>
          {friends.length === 0 ? (
            <div className="empty-community">
              <span className="empty-icon">👥</span>
              <p>Your glow squad is empty</p>
              <span className="empty-hint">Add friends to see their glow scores and challenge each other!</span>
            </div>
          ) : (
            <div className="friends-grid">
              {friends.map(friend => {
                const isPartner = accountabilityPartners.includes(friend.id);
                const friendScore = friendGlowScores[friend.id] || {};
                return (
                  <div key={friend.id} className={`friend-card ${isPartner ? 'is-partner' : ''}`}>
                    <div className="friend-card-header">
                      <span className="friend-avatar-lg">{friend.emoji || '👤'}</span>
                      <span className="partner-badge">{isPartner ? '⭐ Partner' : ''}</span>
                    </div>
                    <h3 className="friend-card-name">{friend.name || 'Glow Friend'}</h3>
                    <div className="friend-quick-stats">
                      <div className="quick-stat">
                        <span className="quick-value">{friendScore.todayProgress || 0}%</span>
                        <span className="quick-label">Today</span>
                      </div>
                      <div className="quick-stat">
                        <span className="quick-value">🔥 {friendScore.streak || 0}</span>
                        <span className="quick-label">Streak</span>
                      </div>
                    </div>
                    <div className="friend-card-actions">
                      <button 
                        className={`button small ${isPartner ? 'partner-btn' : ''}`}
                        onClick={() => togglePartner(friend.id)}
                      >
                        {isPartner ? '✓ Partner' : '+ Partner'}
                      </button>
                      {isPartner && (
                        <button 
                          className="button small nudge-btn"
                          onClick={() => nudgePartner(friend.id)}
                        >
                          👋 Nudge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'accountability' && (
        <div className="accountability-section">
          <div className="accountability-header">
            <div>
              <h2>Accountability Team</h2>
              <p className="section-hint">Keep each other on track with daily progress</p>
            </div>
            <div className="header-actions">
              <button className="button" onClick={() => setShowPartnerSelect(true)}>
                + Add Partner
              </button>
              <button className="button secondary" onClick={() => setShowCreateGroup(true)}>
                + Create Group
              </button>
            </div>
          </div>
          
          {/* Partners List */}
          {accountabilityPartners.length === 0 && groups.length === 0 ? (
            <div className="empty-community">
              <span className="empty-icon">🤝</span>
              <p>No accountability partners yet</p>
              <span className="empty-hint">Add partners or create a group to stay motivated together!</span>
            </div>
          ) : (
            <div className="partners-list">
              {accountabilityPartners.map(partnerId => {
                const partner = partnersData[partnerId];
                const friend = friends.find(f => f.id === partnerId);
                const displayData = partner || friend || {};
                const isAtRisk = displayData.streak > 0 && displayData.streak <= 3;
                const needsPush = !displayData.todayProgress || displayData.todayProgress < 50;
                
                return (
                  <div key={partnerId} className={`partner-card ${needsPush ? 'needs-attention' : ''}`}>
                    <div className="partner-card-main">
                      <div className="partner-avatar-lg">{displayData.emoji || '👤'}</div>
                      <div className="partner-details">
                        <h3>{displayData.name || 'Partner'}</h3>
                        <div className="partner-live-stats">
                          <span className={`status-dot ${needsPush ? 'off' : 'on'}`}></span>
                          <span>{needsPush ? 'Needs a push!' : 'Glowing today!'}</span>
                        </div>
                      </div>
                      <button 
                        className="nudge-btn-lg"
                        onClick={() => nudgePartner(partnerId)}
                        title="Send a nudge"
                      >
                        👋
                      </button>
                    </div>
                    <div className="partner-stats-row">
                      <div className="stat-item">
                        <span className="stat-num">{displayData.todayProgress || 0}%</span>
                        <span className="stat-text">Today</span>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-item">
                        <span className="stat-num">🔥 {displayData.streak || 0}</span>
                        <span className="stat-text">Streak</span>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-item">
                        <span className="stat-num">{displayData.weeklyGlow || 0}%</span>
                        <span className="stat-text">Weekly</span>
                      </div>
                    </div>
                    {isAtRisk && (
                      <div className="partner-alert streak-warning">
                        🔥 Streak at risk! Only {3 - displayData.streak} days left
                      </div>
                    )}
                    <button 
                      className="remove-partner"
                      onClick={() => togglePartner(partnerId)}
                    >
                      Remove Partner
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="groups-section">
              <h3>Your Groups</h3>
              <div className="groups-grid">
                {groups.map(group => {
                  const groupMembers = friends.filter(f => group.members.includes(f.id));
                  return (
                    <div key={group.id} className="group-card">
                      <div className="group-header">
                        <span className="group-icon">👥</span>
                        <h4>{group.name}</h4>
                        <button 
                          className="group-delete"
                          onClick={() => deleteGroup(group.id)}
                        >×</button>
                      </div>
                      <div className="group-members">
                        {groupMembers.slice(0, 4).map(member => (
                          <span key={member.id} className="member-avatar">
                            {member.emoji || '👤'}
                          </span>
                        ))}
                        {groupMembers.length > 4 && (
                          <span className="member-more">+{groupMembers.length - 4}</span>
                        )}
                      </div>
                      <div className="group-stats">
                        <span>{groupMembers.length} members</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Share Settings */}
          <div className="share-settings-section">
            <h3>📤 What You're Sharing</h3>
            <div className="share-toggles">
              <label className={`share-toggle ${shareSettings.dailyProgress ? 'active' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={shareSettings.dailyProgress}
                  onChange={() => updateShareSetting('dailyProgress')}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb"></span>
                </span>
                <span>Daily Progress</span>
              </label>
              <label className={`share-toggle ${shareSettings.glowScores ? 'active' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={shareSettings.glowScores}
                  onChange={() => updateShareSetting('glowScores')}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb"></span>
                </span>
                <span>Glow Scores</span>
              </label>
              <label className={`share-toggle ${shareSettings.streakStatus ? 'active' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={shareSettings.streakStatus}
                  onChange={() => updateShareSetting('streakStatus')}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb"></span>
                </span>
                <span>Streak Status</span>
              </label>
              <label className={`share-toggle ${shareSettings.longTermGoals ? 'active' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={shareSettings.longTermGoals}
                  onChange={() => updateShareSetting('longTermGoals')}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb"></span>
                </span>
                <span>Long-term Goals</span>
              </label>
            </div>
          </div>
          
          {/* Partner Selection Modal */}
          {showPartnerSelect && (
            <div className="modal-overlay" onClick={() => setShowPartnerSelect(false)}>
              <div className="modal partner-select-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Select Partners</h2>
                  <button onClick={() => setShowPartnerSelect(false)}>×</button>
                </div>
                <div className="modal-content">
                  <p className="modal-hint">Choose friends to add to your accountability pod:</p>
                  {friends.length === 0 ? (
                    <p className="empty-message">Add friends first to select partners</p>
                  ) : (
                    <div className="partner-select-list">
                      {friends.map(friend => {
                        const isPartner = accountabilityPartners.includes(friend.id);
                        return (
                          <div 
                            key={friend.id}
                            className={`partner-select-item ${isPartner ? 'selected' : ''}`}
                            onClick={() => togglePartner(friend.id)}
                          >
                            <span className="friend-avatar">{friend.emoji || '👤'}</span>
                            <span className="friend-name">{friend.name || 'Friend'}</span>
                            <span className="select-check">{isPartner ? '✓' : '+'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button className="button" onClick={() => setShowPartnerSelect(false)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Create Group Modal */}
          {showCreateGroup && (
            <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
              <div className="modal create-group-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Create Group</h2>
                  <button onClick={() => setShowCreateGroup(false)}>×</button>
                </div>
                <div className="modal-content">
                  <label className="form-label">Group Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g., Morning Crew"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <label className="form-label">Select Members (min 2)</label>
                  <div className="group-member-select">
                    {friends.map(friend => (
                      <div 
                        key={friend.id}
                        className={`member-checkbox ${selectedGroupMembers.includes(friend.id) ? 'selected' : ''}`}
                        onClick={() => toggleGroupMember(friend.id)}
                      >
                        <span className="friend-avatar">{friend.emoji || '👤'}</span>
                        <span>{friend.name || 'Friend'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button className="button secondary" onClick={() => setShowCreateGroup(false)}>
                      Cancel
                    </button>
                    <button 
                      className="button"
                      onClick={createGroup}
                      disabled={selectedGroupMembers.length < 2}
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="challenges-section">
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
                    'Financial Glow': '💰',
                    'Sleep Champion': '😴',
                    'Healthy Eating': '🥗',
                    'Digital Detox': '📵',
                    'Step Master': '👟',
                    'No Sugar': '🚫🍬',
                    'Self Care': '💆',
                    'Journal Queen': '📓'
                  };
                  const progress = challengeProgress[challenge.id] || { percentage: 0, completed: 0, total: 0, daysCompleted: 0, totalDays: 7 };
                  const daysLeft = Math.max(0, challenge.duration_days - Math.floor((Date.now() - new Date(join.joined_at).getTime()) / (1000 * 60 * 60 * 24)));
                  const isStreakChallenge = progress.isStreakChallenge;
                  
                  return (
                    <div key={join.id} className="my-challenge-card clickable" onClick={() => setSelectedChallengeDetail({ challenge, join })}>
                      <div className="challenge-icon">{challengeEmojis[challenge.title] || '🎯'}</div>
                      <h3>{challenge.title}</h3>
                      {progress.total > 0 || isStreakChallenge ? (
                        <>
                          <div className="challenge-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill glow-progress" 
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <span>{progress.percentage}%</span>
                          </div>
                          <span className="progress-detail">
                            🔥 {progress.daysCompleted}/{progress.totalDays} days completed
                          </span>
                          {progress.daysCompleted > 0 && (
                            <span className="streak-info">Keep it going!</span>
                          )}
                        </>
                      ) : (
                        <p className="no-matching-habits">Add matching habits to track!</p>
                      )}
                      <span className="days-left">{daysLeft} days left</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
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
                  'Financial Glow': '💰',
                  'Sleep Champion': '😴',
                  'Healthy Eating': '🥗',
                  'Digital Detox': '📵',
                  'Step Master': '👟',
                  'No Sugar': '🚫🍬',
                  'Self Care': '💆',
                  'Journal Queen': '📓'
                };
                const matchingKeywords = challengeKeywords[challenge.title] || [];
                return (
                  <div key={challenge.id} className={`challenge-card ${isJoined ? 'joined' : ''}`}>
                    <div className="challenge-header">
                      <span className="challenge-emoji">{challengeEmojis[challenge.title] || '🌟'}</span>
                      <span className="challenge-category">{challenge.category}</span>
                    </div>
                    <h3>{challenge.title}</h3>
                    <p className="challenge-desc">{challenge.description}</p>
                    {matchingKeywords.length > 0 && (
                      <p className="challenge-keywords">Keywords: {matchingKeywords.slice(0, 3).join(', ')}...</p>
                    )}
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

      {/* Challenge Detail Modal */}
      {selectedChallengeDetail && (
        <div className="modal-overlay" onClick={() => setSelectedChallengeDetail(null)}>
          <div className="modal challenge-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedChallengeDetail.challenge.title}</h2>
              <button onClick={() => setSelectedChallengeDetail(null)}>×</button>
            </div>
            <div className="modal-content challenge-detail-content">
              {(() => {
                const details = getChallengeDetails(selectedChallengeDetail.challenge);
                const challenge = selectedChallengeDetail.challenge;
                const progress = challengeProgress[challenge.id] || { percentage: 0 };
                
                return (
                  <>
                    <p className="challenge-detail-desc">{challenge.description}</p>
                    
                    <div className="challenge-stat-highlight">
                      <div className="stat-circle">
                        <span className="stat-number">{progress.percentage}%</span>
                        <span className="stat-text">Complete</span>
                      </div>
                    </div>
                    
                    {details.isStreak ? (
                      <>
                        <div className="detail-section highlight-section">
                          <h4>📊 Overall Progress</h4>
                          <div className="overall-stats">
                            <div className="overall-stat">
                              <span className="overall-number">{details.daysCompleted}</span>
                              <span className="overall-label">Days Completed</span>
                            </div>
                            <div className="overall-divider">/</div>
                            <div className="overall-stat">
                              <span className="overall-number">{details.duration}</span>
                              <span className="overall-label">Total Days</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-section today-section">
                          <h4>☀️ Today's Progress</h4>
                          <div className="today-stats">
                            <div className="today-main">
                              <span className="today-fraction">{details.todayCompletion}/{details.todayTotal}</span>
                              <span className="today-label">habits done</span>
                            </div>
                            <div className="today-progress-bar">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill glow-progress"
                                  style={{ width: `${details.todayTotal > 0 ? (details.todayCompletion / details.todayTotal) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="today-pct">
                                {details.todayTotal > 0 ? Math.round((details.todayCompletion / details.todayTotal) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-section">
                          <h4>📅 Day History</h4>
                          <div className="day-history">
                            {details.dayHistory.map((day, idx) => (
                              <div key={day.date} className={`day-item ${day.isToday ? 'today' : ''} ${day.percentage === 100 ? 'completed' : ''}`}>
                                <span className="day-date">{day.dayName}</span>
                                <div className="day-bar">
                                  <div 
                                    className={`day-fill ${day.percentage === 100 ? 'full' : ''}`}
                                    style={{ width: `${day.percentage}%` }}
                                  />
                                </div>
                                <span className="day-pct">{day.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="detail-section">
                          <h4>💡 Keywords Tracked</h4>
                          <div className="keywords-list">
                            {details.keywords.map(k => (
                              <span key={k} className="keyword-tag">{k}</span>
                            ))}
                          </div>
                        </div>
                        
                        {details.matchingHabits.length > 0 ? (
                          <>
                            <div className="detail-section highlight-section">
                              <h4>☀️ Today's Progress</h4>
                              <div className="today-stats">
                                <div className="today-main">
                                  <span className="today-fraction">{details.todayCompletion}/{details.todayTotal}</span>
                                  <span className="today-label">matching habits done</span>
                                </div>
                                <div className="today-progress-bar">
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill glow-progress"
                                      style={{ width: `${details.todayTotal > 0 ? (details.todayCompletion / details.todayTotal) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="today-pct">
                                    {details.todayTotal > 0 ? Math.round((details.todayCompletion / details.todayTotal) * 100) : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="detail-section">
                              <h4>📋 Matching Habits ({details.matchingHabits.length})</h4>
                              <div className="matching-habits">
                                {details.matchingHabits.map(t => {
                                  const today = new Date().toISOString().split('T')[0];
                                  const isDone = localStorage.getItem(`task_completed_${today}_${t.id}`) === 'true';
                                  return (
                                    <div key={t.id} className={`habit-check-item ${isDone ? 'done' : ''}`}>
                                      <span className="habit-check">{isDone ? '✓' : '○'}</span>
                                      <span className="habit-name">{t.title}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="detail-section">
                            <p className="no-habits-msg">
                              No habits match these keywords yet. Add habits with "{details.keywords[0]}" to track them!
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    <div className="detail-footer">
                      <span className="duration-badge">📅 {challenge.duration_days} days</span>
                      <span className="participants-badge">👥 {challenge.totalParticipants || 0} joined</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="community-section">
          <h2>🏆 Top Streaks</h2>
          {leaderboard.length === 0 ? (
            <div className="empty-community">
              <span className="empty-icon">🔥</span>
              <p>No streaks yet</p>
              <span className="empty-hint">Complete your habits daily to get on the board!</span>
            </div>
          ) : (
            <div className="leaderboard">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className={`leaderboard-item rank-${index + 1}`}>
                  <span className="rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
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
