// data.jsx — default splits, exercise pool, Supabase storage helpers

const SUPABASE_URL = 'https://jcjczthmiolnmvgmjfdt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjamN6dGhtaW9sbm12Z21qZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTAzMjcsImV4cCI6MjA5MzMyNjMyN30.KikLk2xVKYFALHR0dwe8L11ftd6NsnKdjTovlOyRBTQ';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_SPLITS = {
  anterior: {
    id: 'anterior', name: 'Anterior', subtitle: 'Front of body', icon: 'A',
    recommended: true, color: '#6366f1',
    exercises: ['Shoulder Press','Chest Fly','Incline Chest Press','Lateral Raises','Triceps','Abs','Leg Press','Leg Extension','Adductors'],
  },
  posterior: {
    id: 'posterior', name: 'Posterior', subtitle: 'Back of body', icon: 'P',
    recommended: true, color: '#a855f7',
    exercises: ['Upper Back','Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Hamstrings','Calf','Hammer Curl','Hip Thrust','Preacher Curl','Wrist'],
  },
  push: {
    id: 'push', name: 'Push', subtitle: 'Chest · Shoulders · Tri', icon: '↑', color: '#06b6d4',
    exercises: ['Shoulder Press','Chest Fly','Incline Chest Press','Lateral Raises','Triceps','Abs'],
  },
  pull: {
    id: 'pull', name: 'Pull', subtitle: 'Back · Biceps', icon: '↓', color: '#10b981',
    exercises: ['Upper Back','Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Hammer Curl','Preacher Curl','Wrist'],
  },
  upper: {
    id: 'upper', name: 'Upper', subtitle: 'Push + Pull', icon: '⤴', color: '#f59e0b',
    exercises: ['Shoulder Press','Chest Fly','Incline Chest Press','Lateral Raises','Triceps','Upper Back','Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Hammer Curl','Preacher Curl','Wrist'],
  },
  lower: {
    id: 'lower', name: 'Lower', subtitle: 'Legs · Glutes', icon: '⤵', color: '#ef4444',
    exercises: ['Leg Press','Leg Extension','Adductors','Hip Thrust','Hamstrings','Calf'],
  },
};

const SPLIT_ORDER = ['anterior', 'posterior', 'push', 'pull', 'upper', 'lower'];

const EXERCISE_POOL = [
  'Shoulder Press','Chest Fly','Incline Chest Press','Bench Press',
  'Lateral Raises','Front Raises','Triceps','Tricep Pushdown',
  'Overhead Tricep Ext.','Dips','Abs','Cable Crunch','Hanging Leg Raise',
  'Leg Press','Leg Extension','Adductors','Abductors',
  'Squat','Romanian Deadlift','Bulgarian Split Squat',
  'Upper Back','Lat Pulldown','Lat Row Single','Cable Row',
  'Shrugs','Rear Shoulder','Face Pull','Hamstrings','Hamstring Curl',
  'Calf','Standing Calf','Hammer Curl','Bicep Curl',
  'Preacher Curl','Concentration Curl','Hip Thrust','Glute Kickback','Wrist',
];

// ────────────────────────── auth ──────────────────────────
async function authSignUp(email, password, name) {
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { name } },
  });
  if (error) throw error;
  if (data.session) {
    await sb.from('user_data').insert({
      user_id: data.user.id, name,
      splits: defaultUserSplits(), history: [],
    });
    return { needsConfirmation: false };
  }
  return { needsConfirmation: true };
}

async function authSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function authSignOut() {
  await sb.auth.signOut();
}

// ────────────────────────── data ──────────────────────────
async function fetchUserData(userId) {
  const { data } = await sb.from('user_data').select('name, splits, history').eq('user_id', userId).single();
  if (data) return data;
  // First login after email confirmation — seed row from user metadata
  const { data: { user } } = await sb.auth.getUser();
  const name = user?.user_metadata?.name || 'User';
  const fresh = { name, splits: defaultUserSplits(), history: [] };
  await sb.from('user_data').insert({ user_id: userId, ...fresh });
  return fresh;
}

async function pushUserSplits(userId, splits) {
  await sb.from('user_data').update({ splits }).eq('user_id', userId);
}

async function pushUserHistory(userId, history) {
  await sb.from('user_data').update({ history }).eq('user_id', userId);
}

function todayStr() {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function makeId() { return Date.now() + Math.floor(Math.random() * 1000); }

function defaultUserSplits() {
  const out = {};
  SPLIT_ORDER.forEach((id, i) => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SPLITS[id]));
    s.added = i < 2;
    out[id] = s;
  });
  return out;
}

function seedDemoSession(userId, splitId, exercises, daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return { id: d.getTime(), date: dateStr, day: splitId, exercises };
}

Object.assign(window, {
  DEFAULT_SPLITS, SPLIT_ORDER, EXERCISE_POOL,
  sb,
  authSignUp, authSignIn, authSignOut,
  fetchUserData, pushUserSplits, pushUserHistory,
  todayStr, makeId, defaultUserSplits, seedDemoSession,
});
