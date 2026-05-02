// data.jsx — default splits, exercise pool, storage helpers

const DEFAULT_SPLITS = {
  anterior: {
    id: 'anterior',
    name: 'Anterior',
    subtitle: 'Front of body',
    icon: 'A',
    recommended: true,
    color: '#6366f1',
    exercises: [
      'Shoulder Press', 'Chest Fly', 'Incline Chest Press',
      'Lateral Raises', 'Triceps', 'Abs',
      'Leg Press', 'Leg Extension', 'Adductors',
    ],
  },
  posterior: {
    id: 'posterior',
    name: 'Posterior',
    subtitle: 'Back of body',
    icon: 'P',
    recommended: true,
    color: '#a855f7',
    exercises: [
      'Upper Back', 'Lat Pulldown', 'Lat Row Single', 'Shrugs',
      'Rear Shoulder', 'Hamstrings', 'Calf', 'Hammer Curl',
      'Hip Thrust', 'Preacher Curl', 'Wrist',
    ],
  },
  push: {
    id: 'push',
    name: 'Push',
    subtitle: 'Chest · Shoulders · Tri',
    icon: '↑',
    color: '#06b6d4',
    exercises: [
      'Shoulder Press', 'Chest Fly', 'Incline Chest Press',
      'Lateral Raises', 'Triceps', 'Abs',
    ],
  },
  pull: {
    id: 'pull',
    name: 'Pull',
    subtitle: 'Back · Biceps',
    icon: '↓',
    color: '#10b981',
    exercises: [
      'Upper Back', 'Lat Pulldown', 'Lat Row Single', 'Shrugs',
      'Rear Shoulder', 'Hammer Curl', 'Preacher Curl', 'Wrist',
    ],
  },
  upper: {
    id: 'upper',
    name: 'Upper',
    subtitle: 'Push + Pull',
    icon: '⤴',
    color: '#f59e0b',
    exercises: [
      'Shoulder Press', 'Chest Fly', 'Incline Chest Press',
      'Lateral Raises', 'Triceps', 'Upper Back', 'Lat Pulldown',
      'Lat Row Single', 'Shrugs', 'Rear Shoulder', 'Hammer Curl',
      'Preacher Curl', 'Wrist',
    ],
  },
  lower: {
    id: 'lower',
    name: 'Lower',
    subtitle: 'Legs · Glutes',
    icon: '⤵',
    color: '#ef4444',
    exercises: [
      'Leg Press', 'Leg Extension', 'Adductors',
      'Hip Thrust', 'Hamstrings', 'Calf',
    ],
  },
};

const SPLIT_ORDER = ['anterior', 'posterior', 'push', 'pull', 'upper', 'lower'];

const EXERCISE_POOL = [
  'Shoulder Press', 'Chest Fly', 'Incline Chest Press', 'Bench Press',
  'Lateral Raises', 'Front Raises', 'Triceps', 'Tricep Pushdown',
  'Overhead Tricep Ext.', 'Dips', 'Abs', 'Cable Crunch', 'Hanging Leg Raise',
  'Leg Press', 'Leg Extension', 'Adductors', 'Abductors',
  'Squat', 'Romanian Deadlift', 'Bulgarian Split Squat',
  'Upper Back', 'Lat Pulldown', 'Lat Row Single', 'Cable Row',
  'Shrugs', 'Rear Shoulder', 'Face Pull', 'Hamstrings', 'Hamstring Curl',
  'Calf', 'Standing Calf', 'Hammer Curl', 'Bicep Curl',
  'Preacher Curl', 'Concentration Curl', 'Hip Thrust', 'Glute Kickback', 'Wrist',
];

// ────────────────── storage ──────────────────
const SK = (userId, key) => `mw_user_${userId}_${key}`;

function loadUsers() {
  try {
    const raw = localStorage.getItem('mw_users');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveUsers(users) {
  localStorage.setItem('mw_users', JSON.stringify(users));
}
function loadActiveUserId() {
  return localStorage.getItem('mw_active_user') || null;
}
function saveActiveUserId(id) {
  if (id) localStorage.setItem('mw_active_user', id);
  else localStorage.removeItem('mw_active_user');
}

function loadUserData(userId) {
  try {
    const splitsRaw = localStorage.getItem(SK(userId, 'splits'));
    const histRaw = localStorage.getItem(SK(userId, 'history'));
    return {
      splits: splitsRaw ? JSON.parse(splitsRaw) : null,
      history: histRaw ? JSON.parse(histRaw) : [],
    };
  } catch { return { splits: null, history: [] }; }
}
function saveUserSplits(userId, splits) {
  localStorage.setItem(SK(userId, 'splits'), JSON.stringify(splits));
}
function saveUserHistory(userId, history) {
  localStorage.setItem(SK(userId, 'history'), JSON.stringify(history));
}

function todayStr() {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function makeId() { return Date.now() + Math.floor(Math.random() * 1000); }

function defaultUserSplits() {
  // deep clone so each user gets independent copies; mark first 2 as added
  const out = {};
  SPLIT_ORDER.forEach((id, i) => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SPLITS[id]));
    s.added = i < 2; // anterior + posterior added by default
    out[id] = s;
  });
  return out;
}

function seedDemoSession(userId, splitId, exercises, daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return {
    id: d.getTime(),
    date: dateStr,
    day: splitId,
    exercises,
  };
}

Object.assign(window, {
  DEFAULT_SPLITS, SPLIT_ORDER, EXERCISE_POOL,
  loadUsers, saveUsers, loadActiveUserId, saveActiveUserId,
  loadUserData, saveUserSplits, saveUserHistory,
  todayStr, makeId, defaultUserSplits, seedDemoSession,
});
