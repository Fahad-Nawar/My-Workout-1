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

const MUSCLE_MAP = {
  'Chest Fly': 'chest', 'Incline Chest Press': 'chest', 'Bench Press': 'chest',
  'Shoulder Press': 'shoulder', 'Lateral Raises': 'shoulder', 'Front Raises': 'shoulder',
  'Rear Shoulder': 'shoulder', 'Face Pull': 'shoulder',
  'Shrugs': 'back', 'Upper Back': 'back', 'Lat Pulldown': 'back',
  'Lat Row Single': 'back', 'Cable Row': 'back',
  'Triceps': 'triceps', 'Tricep Pushdown': 'triceps',
  'Overhead Tricep Ext.': 'triceps', 'Dips': 'triceps',
  'Hammer Curl': 'biceps', 'Bicep Curl': 'biceps', 'Preacher Curl': 'biceps',
  'Concentration Curl': 'biceps', 'Wrist': 'biceps',
  'Abs': 'abs', 'Cable Crunch': 'abs', 'Hanging Leg Raise': 'abs',
  'Leg Press': 'legs', 'Leg Extension': 'legs', 'Adductors': 'legs', 'Abductors': 'legs',
  'Squat': 'legs', 'Bulgarian Split Squat': 'legs',
  'Hamstrings': 'legs', 'Hamstring Curl': 'legs', 'Romanian Deadlift': 'legs',
  'Hip Thrust': 'legs', 'Glute Kickback': 'legs',
  'Calf': 'calf', 'Standing Calf': 'calf',
};

const MUSCLES = [
  { id: 'chest',    label: 'Chest',    target: 15, color: '#6366f1' },
  { id: 'shoulder', label: 'Shoulder', target: 12, color: '#a855f7' },
  { id: 'back',     label: 'Back',     target: 15, color: '#06b6d4' },
  { id: 'biceps',   label: 'Biceps',   target: 12, color: '#10b981' },
  { id: 'triceps',  label: 'Triceps',  target: 10, color: '#f59e0b' },
  { id: 'legs',     label: 'Legs',     target: 15, color: '#ef4444' },
  { id: 'calf',     label: 'Calf',     target: 10, color: '#ec4899' },
  { id: 'abs',      label: 'Abs',      target: 8,  color: '#8b5cf6' },
];

function parseDateStr(str) {
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = str.replace(/,/g, '').split(/\s+/);
  const dayPart = parts.find(p => /^\d{1,2}$/.test(p));
  const monPart = parts.find(p => months[p] !== undefined);
  const yearPart = parts.find(p => /^\d{4}$/.test(p));
  if (!dayPart || monPart === undefined || !yearPart) return null;
  return new Date(parseInt(yearPart), months[monPart], parseInt(dayPart));
}

function weekSetsByMuscle(history) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun … 5=Fri … 6=Sat
  const daysSinceFriday = (dow - 5 + 7) % 7; // 0 on Fri, 1 on Sat, …, 6 on Thu

  const friday = new Date(today);
  friday.setDate(today.getDate() - daysSinceFriday);
  friday.setHours(0, 0, 0, 0);

  const thursday = new Date(friday);
  thursday.setDate(friday.getDate() + 6);
  thursday.setHours(23, 59, 59, 999);

  const counts = {};
  MUSCLES.forEach(m => { counts[m.id] = 0; });

  history.forEach(sess => {
    const d = parseDateStr(sess.date);
    if (d && d >= friday && d <= thursday) {
      sess.exercises?.forEach(ex => {
        const muscle = MUSCLE_MAP[ex.name];
        if (muscle && counts[muscle] !== undefined) {
          counts[muscle] += ex.sets?.length || 0;
        }
      });
    }
  });

  return counts;
}

// ────────────────────────── utils (shared across screens) ──────────────────────────
function colorFromName(name) {
  const palette = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];
  let h = 0; for (let i = 0; i < (name||'').length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}
function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ────────────────────────── social ──────────────────────────
async function searchUsers(query) {
  const { data } = await sb.from('user_data')
    .select('user_id, name, avatar_url')
    .ilike('name', `%${query}%`)
    .limit(10);
  const { data: { user } } = await sb.auth.getUser();
  return (data || [])
    .filter(u => u.user_id !== user?.id)
    .map(u => ({ ...u, avatarUrl: u.avatar_url || '' }));
}

async function fetchFriendships(userId) {
  const { data, error } = await sb.from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) return [];
  return data || [];
}

async function sendFriendRequest(addresseeId) {
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from('friendships').insert({
    requester_id: user.id, addressee_id: addresseeId,
  });
  if (error) throw error;
}

async function respondToRequest(friendshipId, accept) {
  if (accept) {
    await sb.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  } else {
    await sb.from('friendships').delete().eq('id', friendshipId);
  }
}

async function removeFriend(friendshipId) {
  await sb.from('friendships').delete().eq('id', friendshipId);
}

async function fetchFriendData(friendId) {
  const { data } = await sb.from('user_data')
    .select('name, history, splits, avatar_url')
    .eq('user_id', friendId)
    .single();
  if (!data) return null;
  return { ...data, avatarUrl: data.avatar_url || '' };
}

// ────────────────────────── auth ──────────────────────────
function usernameToEmail(username) {
  return username.toLowerCase().replace(/[^a-z0-9]/g, '_') + '@myworkout.app';
}

async function authSignUp(username, password) {
  const email = usernameToEmail(username);
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { name: username } },
  });
  if (error) throw error;
  if (data.session) {
    await sb.from('user_data').insert({
      user_id: data.user.id, name: username,
      splits: defaultUserSplits(), history: [],
    });
  }
  return data.user;
}

async function authSignIn(username, password) {
  const email = usernameToEmail(username);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function authSignOut() {
  await sb.auth.signOut();
}

// ────────────────────────── data ──────────────────────────
async function fetchUserData(userId) {
  const { data } = await sb.from('user_data')
    .select('name, splits, history, bio, avatar_url')
    .eq('user_id', userId)
    .single();
  if (data) return { ...data, avatarUrl: data.avatar_url || '' };
  // First login after email confirmation — seed row from user metadata
  const { data: { user } } = await sb.auth.getUser();
  const name = user?.user_metadata?.name || 'User';
  const fresh = { name, splits: defaultUserSplits(), history: [], bio: '', avatar_url: '' };
  await sb.from('user_data').insert({ user_id: userId, ...fresh });
  return { ...fresh, avatarUrl: '' };
}

async function pushUserSplits(userId, splits) {
  await sb.from('user_data').update({ splits }).eq('user_id', userId);
}

async function pushUserHistory(userId, history) {
  await sb.from('user_data').update({ history }).eq('user_id', userId);
}

async function pushUserProfile(userId, { bio, avatarUrl }) {
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
  if (!Object.keys(updates).length) return;
  await sb.from('user_data').update(updates).eq('user_id', userId);
}

async function uploadAvatar(userId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
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
  DEFAULT_SPLITS, SPLIT_ORDER, EXERCISE_POOL, MUSCLE_MAP, MUSCLES,
  sb,
  colorFromName, initialsOf,
  authSignUp, authSignIn, authSignOut,
  fetchUserData, pushUserSplits, pushUserHistory, pushUserProfile, uploadAvatar,
  todayStr, makeId, defaultUserSplits, seedDemoSession,
  parseDateStr, weekSetsByMuscle,
  searchUsers, fetchFriendships, sendFriendRequest,
  respondToRequest, removeFriend, fetchFriendData,
});
