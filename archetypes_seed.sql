-- Disciplined Creator
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Disciplined Creator',
  '🔥',
  'Build consistency and create your masterpiece',
  ARRAY['Creator', 'Disciplined', 'Achiever'],
  '[{"title": "Deep work session (2hrs)", "category": "Career", "time": "09:00"}, {"title": "Check analytics", "category": "Career", "time": "12:00"}, {"title": "Work on passion project", "category": "Career", "time": "18:00"}, {"title": "Meditate", "category": "Mindset", "time": "07:00"}, {"title": "Read 30 minutes", "category": "Mindset", "time": "21:00"}, {"title": "Journaling", "category": "Mindset", "time": "22:00"}, {"title": "Exercise", "category": "Health", "time": "08:00"}, {"title": "Drink 8 glasses water", "category": "Health", "time": "all-day"}]'
);

-- Healthy Woman
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Healthy Woman',
  '🌸',
  'Prioritize your body and wellness',
  ARRAY['Healthy', 'Radiant', 'Balanced'],
  '[{"title": "Take vitamins", "category": "Health", "time": "08:00"}, {"title": "Exercise", "category": "Health", "time": "07:00"}, {"title": "Meal prep", "category": "Health", "time": "18:00"}, {"title": "Sleep 8 hours", "category": "Health", "time": "22:00"}, {"title": "Skincare routine", "category": "Beauty", "time": "08:00"}, {"title": "Moisturize", "category": "Beauty", "time": "22:00"}, {"title": "Gratitude practice", "category": "Mindset", "time": "07:00"}]'
);

-- Wealth Builder
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Wealth Builder',
  '💰',
  'Build financial freedom and abundance',
  ARRAY['Wealthy', 'Smart', 'Strategic'],
  '[{"title": "Track expenses", "category": "Finances", "time": "09:00"}, {"title": "Review investments", "category": "Finances", "time": "12:00"}, {"title": "Work on side hustle", "category": "Finances", "time": "19:00"}, {"title": "Read finance books", "category": "Mindset", "time": "21:00"}, {"title": "Morning exercise", "category": "Health", "time": "07:00"}, {"title": "Network", "category": "Career", "time": "15:00"}]'
);

-- Radiant Beauty
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Radiant Beauty',
  '✨',
  'Glow from within and shine outward',
  ARRAY['Beautiful', 'Confident', 'Radiant'],
  '[{"title": "Skincare routine", "category": "Beauty", "time": "08:00"}, {"title": "Apply sunscreen", "category": "Beauty", "time": "09:00"}, {"title": "Hair care", "category": "Beauty", "time": "20:00"}, {"title": "Self-care ritual", "category": "Beauty", "time": "21:00"}, {"title": "Healthy eating", "category": "Health", "time": "12:00"}, {"title": "Exercise", "category": "Health", "time": "07:00"}, {"title": "Meditation", "category": "Spirituality", "time": "07:00"}]'
);

-- Spiritual Warrior
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Spiritual Warrior',
  '🧘',
  'Connect with your higher self',
  ARRAY['Spiritual', 'Intuitive', 'Wise'],
  '[{"title": "Meditate", "category": "Spirituality", "time": "06:00"}, {"title": "Pray", "category": "Spirituality", "time": "07:00"}, {"title": "Read spiritual texts", "category": "Spirituality", "time": "21:00"}, {"title": "Affirmations", "category": "Mindset", "time": "08:00"}, {"title": "Journal", "category": "Mindset", "time": "22:00"}, {"title": "Yoga", "category": "Health", "time": "18:00"}, {"title": "Nature walk", "category": "Health", "time": "17:00"}]'
);

-- Calm & Centered
INSERT INTO archetypes (name, emoji, description, default_identities, template_habits)
VALUES (
  'Calm & Centered',
  '🦋',
  'Master your mind and emotions',
  ARRAY['Mindful', 'Calm', 'Centered'],
  '[{"title": "Morning meditation", "category": "Spirituality", "time": "06:00"}, {"title": "Breathwork", "category": "Mindset", "time": "07:00"}, {"title": "Therapy/Coaching", "category": "Mindset", "time": "10:00"}, {"title": "Digital detox", "category": "Mindset", "time": "21:00"}, {"title": "Sleep early", "category": "Health", "time": "22:00"}, {"title": "Healthy meal", "category": "Health", "time": "12:00"}]'
);
