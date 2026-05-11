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
    exercises: ['Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Calf','Hammer Curl','Hip Thrust','Preacher Curl','Wrist','T-Bar Row','Leg Curl'],
  },
  push: {
    id: 'push', name: 'Push', subtitle: 'Chest · Shoulders · Tri', icon: '↑', color: '#06b6d4',
    exercises: ['Shoulder Press','Chest Fly','Incline Chest Press','Lateral Raises','Triceps','Abs'],
  },
  pull: {
    id: 'pull', name: 'Pull', subtitle: 'Back · Biceps', icon: '↓', color: '#10b981',
    exercises: ['Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Hammer Curl','Preacher Curl','Wrist'],
  },
  upper: {
    id: 'upper', name: 'Upper', subtitle: 'Push + Pull', icon: '⤴', color: '#f59e0b',
    exercises: ['Shoulder Press','Chest Fly','Incline Chest Press','Lateral Raises','Triceps','Lat Pulldown','Lat Row Single','Shrugs','Rear Shoulder','Hammer Curl','Preacher Curl','Wrist'],
  },
  lower: {
    id: 'lower', name: 'Lower', subtitle: 'Legs · Glutes', icon: '⤵', color: '#ef4444',
    exercises: ['Leg Press','Leg Extension','Adductors','Hip Thrust','Calf'],
  },
  pro: {
    id: 'pro', name: 'Pro', subtitle: 'Advanced · Compounds', icon: '★', color: '#f59e0b',
    recommended: true,
    exercises: ['Bench Press','Incline Chest Press','Shoulder Press','Lateral Raises','Pull Up','T-Bar Row','Squat','Romanian Deadlift','Deadlift','Triceps','Hammer Curl'],
  },
  arms: {
    id: 'arms', name: 'Arms', subtitle: 'Shoulders · Biceps · Triceps', icon: 'Ar', color: '#ec4899',
    recommended: true,
    exercises: ['Hammer Curl','Preacher Curl','Wrist','Tricep Pushdown','Overhead Tricep Ext.','Shoulder Press','Lateral Raises','Rear Shoulder'],
  },
};

const SPLIT_ORDER = ['anterior', 'posterior', 'push', 'pull', 'upper', 'lower', 'pro', 'arms'];

const EXERCISE_POOL = [
  // Chest
  'Chest Fly','Incline Chest Press','Bench Press',
  'Flat DB','Cable Fly','Push Up',
  // Shoulders
  'Shoulder Press','Lateral Raises','Rear Shoulder','Face Pull',
  'Cable Lateral Raise',
  // Triceps
  'Triceps','Tricep Pushdown','Overhead Tricep Ext.','Dips',
  'JM press',
  // Biceps
  'Hammer Curl','Bicep Curl','Preacher Curl','Wrist',
  'Cable Curl',
  // Back
  'Lat Pulldown','Lat Row Single','Cable Row',
  'Shrugs','Pull Up','T-Bar Row','Chest Supported Row',
  // Abs
  'Abs','Cable Crunch','Plank','Ab Wheel',
  // Legs
  'Leg Press','Leg Extension','Adductors','Abductors',
  'Squat','Romanian Deadlift','Bulgarian Split Squat',
  'Hack Squat','Leg Curl','Sumo Deadlift','Deadlift',
  'Hip Thrust',
  // Calf
  'Calf',
];

const MUSCLE_MAP = {
  // Chest
  'Chest Fly': 'chest', 'Incline Chest Press': 'chest', 'Bench Press': 'chest',
  'Flat DB Press': 'chest', 'Cable Fly': 'chest', 'Push Up': 'chest',
  // Shoulders
  'Shoulder Press': 'shoulder', 'Lateral Raises': 'shoulder', 
  'Rear Shoulder': 'shoulder', 'Face Pull': 'shoulder', 'Cable Lateral Raise': 'shoulder',
  // Back
  'Shrugs': 'back', 'Lat Pulldown': 'back', 'Lat Row Single': 'back',
  'Cable Row': 'back','Pull Up': 'back',
  'T-Bar Row': 'back', 'Chest Supported Row': 'back',
  // Triceps
  'Triceps': 'triceps', 'Tricep Pushdown': 'triceps',
  'Overhead Tricep Ext.': 'triceps', 'Dips': 'triceps', 'JM press': 'triceps',
  // Biceps
  'Hammer Curl': 'biceps', 'Bicep Curl': 'biceps', 'Preacher Curl': 'biceps',
  'Wrist': 'biceps', 'Cable Curl': 'biceps',
  // Abs
  'Abs': 'abs', 'Cable Crunch': 'abs',
  'Plank': 'abs', 'Ab Wheel': 'abs',
  // Legs
  'Leg Press': 'legs', 'Leg Extension': 'legs', 'Adductors': 'legs', 'Abductors': 'legs',
  'Squat': 'legs', 'Bulgarian Split Squat': 'legs', 'Hack Squat': 'legs',
  'Leg Curl': 'legs', 'Sumo Deadlift': 'legs', 'Romanian Deadlift': 'legs',
  'Hip Thrust': 'legs', 'Deadlift': 'legs',
  // Calf
  'Calf': 'calf',
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

// ─── Arabic translations ───────────────────────────────────────────────────
const AR = {
  // Exercises
  'Chest Fly':'تجميع صدر','Incline Chest Press':'صدر علوي','Bench Press':'بنش برس',
  'Flat DB':'صدر دمبل مستوي','Cable Fly':'تجميع صدر كيبل','Push Up':'ضغط أرضي',
  'Shoulder Press':'كتف امامي','Lateral Raises':'رفرفة جانبية',
  'Rear Shoulder':'كتف خلفي','Face Pull':'سحب للوجه','Cable Lateral Raise':'رفرفة جانبية كيبل',
  'Triceps':'ترايسبس','Tricep Pushdown':'دفع ترايسبس كيبل',
  'Overhead Tricep Ext.':'تمديد ترايسبس فوق الرأس','Dips':'ديبس','JM press':'جي إم برس',
  'Hammer Curl':'هامر كيرل','Bicep Curl':'بايسبس كيرل','Preacher Curl':'كيرل على المقعد',
  'Wrist':'ساعد','Cable Curl':'بايسبس كيبل',
  'Lat Pulldown':'سحب علوي','Lat Row Single':'سحب لاتس يد واحدة','Cable Row':'سحب كيبل أرضي',
  'Shrugs':'ترابيس','Pull Up':'عقلة','T-Bar Row':'سحب تي بار','Chest Supported Row':'سحب ظهر مدعوم بالصدر',
  'Abs':'بطن','Cable Crunch':'كرنش كيبل','Plank':'بلانك','Ab Wheel':'عجلة البطن',
  'Leg Press':'دفع أرجل','Leg Extension':'تمديد الأرجل',
  'Adductors':'عضلة داخل الفخذ','Abductors':'عضلة خارج الفخذ',
  'Squat':'سكوات','Romanian Deadlift':'ديدلفت روماني','Bulgarian Split Squat':'سكوات بلغاري',
  'Hack Squat':'هاك سكوات','Leg Curl':'ثني الأرجل','Sumo Deadlift':'ديدلفت سومو',
  'Deadlift':'ديدلفت','Hip Thrust':'رفع الحوض','Calf':'بطات',
  // Muscle labels
  'Chest':'صدر','Shoulder':'كتف','Back':'ظهر','Biceps':'بايسبس','Legs':'أرجل',
  // Split names
  'Anterior':'الجزء الأمامي','Posterior':'الجزء الخلفي',
  'Push':'دفع','Pull':'سحب','Upper':'الجزء العلوي','Lower':'الجزء السفلي',
  'Pro':'احترافي','Arms':'الذراعان',
  // Split subtitles
  'Front of body':'مقدمة الجسم','Back of body':'خلفية الجسم',
  'Chest · Shoulders · Tri':'صدر · كتف · ترايسبس','Back · Biceps':'ظهر · بايسبس',
  'Push + Pull':'دفع + سحب','Legs · Glutes':'أرجل · مؤخرة',
  // Sidebar / nav
  'Dashboard':'الرئيسية','History':'السجل','Volume':'الحجم','Friends':'الأصدقاء',
  'Edit splits':'تعديل البرامج','Profile':'الملف الشخصي',
  'Quick start':'بداية سريعة',
  // Mobile tabs
  'HOME':'الرئيسية','LOG':'السجل','VOLUME':'الحجم','FRIENDS':'الأصدقاء',
  // Stats
  'Total Sessions':'إجمالي الجلسات','Current Streak':'السلسلة الحالية',
  'Today':'اليوم','Active Splits':'البرامج النشطة',
  // Dashboard
  'Your splits':'برامجك','Recommended 6-day rotation':'دوران أسبوعي 6 أيام موصى به',
  'Add split':'إضافة برنامج','View progress':'عرض التقدم','Save':'حفظ','Cancel':'إلغاء',
  // Volume panel
  'Weekly Volume':'الحجم الأسبوعي','Resets tomorrow':'يعاد غداً',
  'Target sets per muscle · resets Friday':'الحد المستهدف لكل عضلة · يعاد كل جمعة',
  'Weekly minimum sets per muscle. Resets every Friday.':'الحد الأدنى للمجاميع الأسبوعية لكل عضلة. يعاد كل جمعة.',
  // Welcome
  "Hey {name} — let's lift.":'أهلاً {name} — لنرفع الأثقال',
  // Generic
  'sessions':'جلسة','session':'جلسة','sets':'مجموعة','exercises':'تمرين',
  'No splits yet — click Add split to get started.':'لا توجد برامج بعد — اضغط إضافة برنامج للبدء.',
  // Edit splits screen
  'Customize your routine':'خصص برنامجك','Custom':'مخصص',
  'No exercises yet — add some below.':'لا توجد تمارين بعد — أضف بعضها أدناه.',
  'Add from library':'إضافة من المكتبة',
  // History / Progress screens
  'Progress':'التقدم','No sessions yet — log your first workout!':'لا توجد جلسات بعد — سجّل أول تمرين لك!',
  'Delete session':'حذف الجلسة','Export to Excel':'تصدير إلى Excel',
  // Misc
  'Social':'اجتماعي','Add friend':'إضافة صديق','Bio':'نبذة','Loading...':'جارٍ التحميل...',
  'Wants to be your friend':'يريد إضافتك كصديق','Decline':'رفض','Accept':'قبول',
  'Recent sessions':'الجلسات الأخيرة','Splits':'البرامج','Copied':'تم النسخ','Copy':'نسخ',
  'Sessions':'الجلسات','Sets / week':'مجموعات / أسبوع',
  'No sessions logged yet':'لا توجد جلسات مسجلة بعد',
  'No friends yet':'لا يوجد أصدقاء بعد','Find friends by their username':'ابحث عن الأصدقاء باسم المستخدم',
  'Requests':'طلبات','Friends':'الأصدقاء','Sent':'مرسل',
};

const AR_REVERSE = Object.fromEntries(Object.entries(AR).map(([k, v]) => [v, k]));

const LangContext = React.createContext('en');
function tr(key, lang) {
  if (!lang || !key) return key || '';
  if (lang === 'ar') return AR[key] || key;
  // Reverse-translate Arabic strings stored from a previous Arabic session
  return AR_REVERSE[key] || key;
}

function toEnglishNumerals(str) {
  return String(str)
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => d.charCodeAt(0) - 0x06F0);
}

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

function allWeeksByMuscle(history) {
  const weeks = new Map();
  history.forEach(sess => {
    const d = parseDateStr(sess.date);
    if (!d) return;
    const daysSinceFriday = (d.getDay() - 5 + 7) % 7;
    const friday = new Date(d);
    friday.setDate(d.getDate() - daysSinceFriday);
    friday.setHours(0, 0, 0, 0);
    const thursday = new Date(friday);
    thursday.setDate(friday.getDate() + 6);
    const key = friday.toISOString().slice(0, 10);
    if (!weeks.has(key)) {
      const label = `${friday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${thursday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
      const counts = {};
      MUSCLES.forEach(m => { counts[m.id] = 0; });
      weeks.set(key, { key, label, friday: friday.getTime(), counts, totalSets: 0 });
    }
    const week = weeks.get(key);
    sess.exercises?.forEach(ex => {
      const muscle = MUSCLE_MAP[ex.name];
      const sets = ex.sets?.length || 0;
      if (muscle && week.counts[muscle] !== undefined) {
        week.counts[muscle] += sets;
        week.totalSets += sets;
      }
    });
  });
  return [...weeks.values()].sort((a, b) => b.friday - a.friday);
}

function loadVolumeTargets() {
  try { return JSON.parse(localStorage.getItem('mw-volume-targets') || 'null'); } catch { return null; }
}
function saveVolumeTargets(targets) {
  localStorage.setItem('mw-volume-targets', JSON.stringify(targets));
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
    .select('name, history, splits, avatar_url, bio')
    .eq('user_id', friendId)
    .single();
  if (!data) return null;
  return { ...data, avatarUrl: data.avatar_url || '', bio: data.bio || '' };
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
  if (data) {
    // Inject any new default splits the user doesn't have yet
    let splits = data.splits || {};
    let changed = false;
    SPLIT_ORDER.forEach(id => {
      if (!splits[id]) {
        const s = JSON.parse(JSON.stringify(DEFAULT_SPLITS[id]));
        s.added = false;
        splits[id] = s;
        changed = true;
      }
    });
    if (changed) await sb.from('user_data').update({ splits }).eq('user_id', userId);
    return { ...data, splits, avatarUrl: data.avatar_url || '' };
  }
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

async function pushUserName(userId, name) {
  const { error } = await sb.from('user_data').update({ name }).eq('user_id', userId);
  if (error) throw error;
}

async function checkUsernameAvailable(name, currentUserId) {
  const { data } = await sb.from('user_data')
    .select('user_id')
    .eq('name', name)
    .neq('user_id', currentUserId)
    .limit(1);
  return !data || data.length === 0;
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
  const defaultAdded = ['push', 'pull', 'lower'];
  SPLIT_ORDER.forEach((id) => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SPLITS[id]));
    s.added = defaultAdded.includes(id);
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
  AR, LangContext, tr,
  toEnglishNumerals,
  sb,
  colorFromName, initialsOf,
  authSignUp, authSignIn, authSignOut,
  fetchUserData, pushUserSplits, pushUserHistory, pushUserProfile, pushUserName, checkUsernameAvailable, uploadAvatar,
  todayStr, makeId, defaultUserSplits, seedDemoSession,
  parseDateStr, weekSetsByMuscle, allWeeksByMuscle,
  loadVolumeTargets, saveVolumeTargets,
  searchUsers, fetchFriendships, sendFriendRequest,
  respondToRequest, removeFriend, fetchFriendData,
});
