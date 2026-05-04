// screens.jsx — all app screens (login, dashboard, logger, edit, history, progress)

const { useState, useEffect, useRef, useMemo } = React;

// ──────────────────────────── Shared UI atoms ────────────────────────────
function FounderBadge() {
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
      background: 'rgba(99,102,241,.15)', color: 'var(--accent)',
      border: '1px solid rgba(99,102,241,.3)', borderRadius: 4,
      padding: '1px 5px', whiteSpace: 'nowrap', verticalAlign: 'middle', marginLeft: 5,
    }}>FOUNDER</span>
  );
}

function AvatarView({ name, avatarUrl, size, style: extraStyle }) {
  const sz = size || 42;
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        style={{ width: sz, height: sz, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...extraStyle }}/>
    );
  }
  const palette = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];
  let h = 0; for (let i = 0; i < (name||'').length; i++) h = (h * 31 + (name||'').charCodeAt(i)) | 0;
  const bg = palette[Math.abs(h) % palette.length];
  const parts = (name||'').trim().split(/\s+/).filter(Boolean);
  const initials = !parts.length ? '?' : parts.length === 1 ? parts[0].slice(0,2).toUpperCase() : (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%', background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(sz * 0.38), fontWeight: 700, color: 'white', ...extraStyle,
    }}>{initials}</div>
  );
}

// ────────────────────────── Login / Sign Up ──────────────────────────
function LoginScreen({ onLogin, onSignUp }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!username.trim() || !password) return;
    setBusy(true);
    try {
      if (mode === 'signup') {
        await onSignUp(username.trim(), password);
      } else {
        await onLogin(username.trim(), password);
      }
    } catch (e) {
      setError(e.message.includes('Invalid') ? 'Wrong username or password' : e.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px 24px', justifyContent: 'center' }} className="mw-fade-in">
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 16, background: 'var(--grad)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 24px rgba(99,102,241,.4)' }}>
          <Icon name="dumbbell" size={28} color="white"/>
        </div>
        <div className="mw-eyebrow" style={{ marginBottom: 6 }}>MyWorkout</div>
        <h1 className="mw-h1 mw-grad-text" style={{ fontSize: 32 }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="mw-eyebrow" style={{ marginBottom: 6 }}>Username</div>
          <input className="mw-input" placeholder="e.g. Fahad" value={username}
            onChange={e => setUsername(e.target.value)}/>
        </div>
        <div>
          <div className="mw-eyebrow" style={{ marginBottom: 6 }}>Password</div>
          <input className="mw-input" type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}/>
        </div>
        {mode === 'signup' && (
          <div style={{ fontSize: 12, color: 'var(--text-mute)', paddingLeft: 4 }}>Password must be at least 6 characters</div>
        )}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, padding: '8px 12px', background: '#ef444420', borderRadius: 8 }}>{error}</div>
        )}
        <button className="mw-btn mw-btn-primary" onClick={submit} disabled={busy} style={{ opacity: busy ? 0.6 : 1, marginTop: 4 }}>
          {busy ? <div className="mw-spinner"/> : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <button className="mw-btn mw-btn-ghost" onClick={switchMode}>
          {mode === 'login' ? "New here? Create account" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────── Dashboard ──────────────────────────
function Dashboard({ user, splits, history, onPickSplit, onEditSplits, onLogout, onGo, onToggleSplit, onToggleTheme, theme }) {
  const allList = SPLIT_ORDER.map(id => splits[id]).filter(Boolean);
  Object.values(splits).forEach(s => { if (!SPLIT_ORDER.includes(s.id)) allList.push(s); });
  const splitsList = allList.filter(s => s.added !== false);
  const availableList = allList.filter(s => s.added === false);
  const [showPicker, setShowPicker] = useState(false);

  const todaySessions = history.filter(h => h.date === todayStr());

  return (
    <div className="mw-scroll mw-fade-in" style={{ height: '100%', padding: '12px 16px 100px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          className="mw-btn mw-btn-icon"
          onClick={() => onGo('profile')}
          style={{ padding: 0, width: 'auto', height: 'auto', background: 'none', border: 'none' }}
          aria-label="View profile"
        >
          <AvatarView name={user.name} avatarUrl={user.avatarUrl} size={32} style={{ cursor: 'pointer' }}/>
        </button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">welcome,</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
        </div>
        <button className="mw-btn mw-btn-icon" onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} color="var(--text-dim)"/>
        </button>
        <button className="mw-btn mw-btn-icon" onClick={onLogout} aria-label="Switch user">
          <Icon name="logout" size={16} color="var(--text-dim)"/>
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
        <div className="mw-stat">
          <div className="mw-stat-num mw-grad-text">{history.length}</div>
          <div className="mw-stat-lbl">Sessions</div>
        </div>
        <div className="mw-stat">
          <div className="mw-stat-num">{streakOf(history)}</div>
          <div className="mw-stat-lbl">Streak</div>
        </div>
        <div className="mw-stat">
          <div className="mw-stat-num">{todaySessions.length}</div>
          <div className="mw-stat-lbl">Today</div>
        </div>
      </div>

      <MuscleVolumeCard history={history}/>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <h2 className="mw-h2">Your splits</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => setShowPicker(true)}>
            <Icon name="plus" size={12}/> Add
          </button>
          <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={onEditSplits}>
            <Icon name="edit" size={12}/> Edit
          </button>
        </div>
      </div>

      <div className="mw-eyebrow" style={{ marginBottom: 8 }}>{splitsList.length === 6 ? 'Recommended · 6-day rotation' : `${splitsList.length} split${splitsList.length===1?'':'s'} active`}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {splitsList.map((s) => (
          <SplitCard key={s.id} split={s} sessions={history.filter(h => h.day === s.id).length}
            todayDone={todaySessions.some(t => t.day === s.id)}
            onClick={() => onPickSplit(s.id)} />
        ))}
        {splitsList.length === 0 && (
          <div className="mw-mute" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, fontSize: 13, border: '1px dashed var(--border)', borderRadius: 12 }}>
            No splits yet — tap <strong>Add</strong> to add one.
          </div>
        )}
      </div>

      {showPicker && (
        <SplitPicker available={availableList} all={allList}
          onAdd={(id) => onToggleSplit(id, true)}
          onRemove={(id) => onToggleSplit(id, false)}
          onClose={() => setShowPicker(false)}
          onCreateCustom={() => { setShowPicker(false); onEditSplits(); }}/>
      )}
    </div>
  );
}

function SplitPicker({ available, all, onAdd, onRemove, onClose, onCreateCustom }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', flexDirection: 'column' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ marginTop: 'auto', background: 'var(--surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '16px 16px 24px', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 className="mw-h2">Add to your workout</h2>
          <button className="mw-btn mw-btn-icon" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <p className="mw-mute" style={{ fontSize: 12, marginBottom: 16 }}>Recommended splits — tap to add. You can always remove them later.</p>

        <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Recommended · {available.length} available</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingBottom: 8 }}>
          {available.length === 0 && (
            <div className="mw-mute" style={{ fontSize: 12, padding: 14, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
              All recommended splits are already in your workout.
            </div>
          )}
          {available.map(s => (
            <button key={s.id} className="mw-card" onClick={() => onAdd(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (s.color || '#6366f1') + '22', color: s.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.icon || s.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div className="mw-mute" style={{ fontSize: 11 }}>{s.subtitle} · {s.exercises.length} exercises</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={14} color="white"/>
              </div>
            </button>
          ))}

          <div className="mw-eyebrow" style={{ marginTop: 8, marginBottom: 4 }}>In your workout</div>
          {all.filter(s => s.added !== false).map(s => (
            <div key={s.id} className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (s.color || '#6366f1') + '22', color: s.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.icon || s.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div className="mw-mute" style={{ fontSize: 11 }}>{s.exercises.length} exercises</div>
              </div>
              <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => onRemove(s.id)}>Remove</button>
            </div>
          ))}
        </div>

        <button className="mw-btn mw-btn-ghost" onClick={onCreateCustom} style={{ marginTop: 8 }}>
          <Icon name="sparkle" size={14}/> Create a custom split
        </button>
      </div>
    </div>
  );
}



function SplitCard({ split, sessions, todayDone, onClick }) {
  return (
    <div className={`mw-splitcard ${split.recommended ? 'recommended' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: split.color ? split.color + '22' : 'var(--accent-soft)',
          color: split.color || 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, fontFamily: 'var(--mono)',
        }}>{split.icon || split.name[0]}</div>
        {todayDone && <span className="mw-dot" title="Today done"/>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{split.name}</div>
      <div className="mw-mute" style={{ fontSize: 11, marginBottom: 10 }}>{split.subtitle || `${split.exercises.length} exercises`}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mw-pill">{split.exercises.length} ex</span>
        <span className="mw-mute" style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>{sessions} logged</span>
      </div>
    </div>
  );
}

function MuscleVolumeCard({ history }) {
  const counts = useMemo(() => weekSetsByMuscle(history), [history]);
  const totalSets = MUSCLES.reduce((a, m) => a + (counts[m.id] || 0), 0);
  return (
    <div className="mw-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="mw-eyebrow">This week</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Weekly Volume</div>
        </div>
        <span className="mw-chip"><Icon name="flame" size={10}/> {totalSets} sets</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MUSCLES.map(m => {
          const count = counts[m.id] || 0;
          const pct = Math.min(count / m.target, 1);
          const done = count >= m.target;
          return (
            <div key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>{m.label}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: done ? '#22c55e' : 'var(--text-mute)' }}>{count}/{m.target}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: done ? '#22c55e' : m.color, borderRadius: 2, transition: 'width .4s' }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function streakOf(history) {
  if (!history.length) return 0;
  const dates = new Set(history.map(h => h.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const ds = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    if (dates.has(ds)) { streak++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// ────────────────────────── Logger ──────────────────────────
function Logger({ split, history, onBack, onSave, onEditSplit }) {
  // state[exerciseName] = [{weight, reps}, ...]
  const todaySession = history.find(h => h.date === todayStr() && h.day === split.id);

  const [state, setState] = useState(() => {
    const init = {};
    split.exercises.forEach(name => {
      const existing = todaySession?.exercises.find(e => e.name === name);
      init[name] = existing?.sets?.length ? existing.sets : [{ weight: '', reps: '' }];
    });
    return init;
  });

  const [expanded, setExpanded] = useState(split.exercises[0] || null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showTimer, setShowTimer] = useState(false);

  const updateSet = (ex, i, field, value) => {
    setState(s => ({
      ...s,
      [ex]: s[ex].map((set, idx) => idx === i ? { ...set, [field]: value } : set),
    }));
  };
  const addSet = (ex) => setState(s => {
    const sets = s[ex] || [];
    const last = sets[sets.length - 1] || {};
    return { ...s, [ex]: [...sets, { weight: last.weight || '', reps: last.reps || '' }] };
  });
  const removeSet = (ex, i) => setState(s => ({ ...s, [ex]: s[ex].filter((_, idx) => idx !== i) }));
  const bumpWeight = (ex, i, delta) => {
    setState(s => ({
      ...s,
      [ex]: s[ex].map((set, idx) => {
        if (idx !== i) return set;
        const cur = parseFloat(set.weight) || 0;
        const next = Math.max(0, cur + delta);
        return { ...set, weight: String(next % 1 === 0 ? next : next.toFixed(1)) };
      }),
    }));
  };

  const handleSave = () => {
    setSaving(true);
    const exercises = split.exercises
      .map(name => ({ name, sets: (state[name] || []).filter(s => s.weight || s.reps) }))
      .filter(e => e.sets.length);
    if (!exercises.length) {
      setToast({ msg: 'Fill at least one set first', color: 'var(--danger)' });
      setSaving(false);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setTimeout(() => {
      onSave(exercises);
      setSaving(false);
      setToast({ msg: 'Session saved ✓', color: 'var(--success)' });
      setTimeout(() => setToast(null), 1800);
    }, 500);
  };

  const filledCount = Object.values(state).filter(sets => sets.some(s => s.weight || s.reps)).length;

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">{todayStr()}</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{split.name} <span className="mw-mute" style={{ fontSize: 12, fontWeight: 400 }}>· {filledCount}/{split.exercises.length}</span></div>
        </div>
        <button className="mw-btn mw-btn-icon" onClick={() => setShowTimer(true)} title="Rest timer">
          <Icon name="timer" size={16} color="var(--text-dim)"/>
        </button>
        <button className="mw-btn mw-btn-icon" onClick={onEditSplit} title="Edit split">
          <Icon name="edit" size={14} color="var(--text-dim)"/>
        </button>
      </div>

      {todaySession && (
        <div style={{ padding: '10px 16px 0' }}>
          <div className="mw-resume">
            <Icon name="play" size={12}/> Resuming today's session — your sets are loaded.
          </div>
        </div>
      )}

      <div className="mw-scroll" style={{ flex: 1, padding: '12px 16px 80px' }}>
        {split.exercises.map((ex, idx) => (
          <ExerciseCard key={ex} name={ex} index={idx} sets={state[ex] || []}
            expanded={expanded === ex}
            onToggle={() => setExpanded(expanded === ex ? null : ex)}
            onUpdate={(i, f, v) => updateSet(ex, i, f, v)}
            onAdd={() => addSet(ex)}
            onRemove={(i) => removeSet(ex, i)}
            onBump={(i, d) => bumpWeight(ex, i, d)}
            lastSet={lastSetOf(history, ex)}
          />
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <button className="mw-btn mw-btn-primary" onClick={handleSave} disabled={saving}
          style={{ width: '100%', height: 50, fontSize: 15 }}>
          {saving ? <div className="mw-spinner"/> : <><Icon name="check" size={16} color="white"/> Save session</>}
        </button>
      </div>

      {toast && <div className="mw-toast" style={{ borderColor: toast.color, color: toast.color }}>{toast.msg}</div>}
      {showTimer && <RestTimer onClose={() => setShowTimer(false)}/>}
    </div>
  );
}

function RestTimer({ onClose }) {
  const [secs, setSecs] = useState(90);
  useEffect(() => {
    if (secs <= 0) { onClose(); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 28, padding: '36px 48px', textAlign: 'center', border: '1px solid var(--border)', minWidth: 240 }}>
        <div className="mw-eyebrow" style={{ marginBottom: 12 }}>Rest Timer</div>
        <div style={{ fontSize: 80, fontWeight: 800, fontFamily: 'var(--mono)', letterSpacing: '-0.04em', lineHeight: 1, color: secs <= 10 ? 'var(--danger)' : 'var(--text)' }}>
          {m}:{String(s).padStart(2, '0')}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="mw-btn mw-btn-sm" onClick={() => setSecs(prev => prev + 30)}>+30s</button>
          <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={onClose}>Done</button>
        </div>
        <div className="mw-mute" style={{ fontSize: 11, marginTop: 14 }}>Tap outside to dismiss</div>
      </div>
    </div>
  );
}

function lastSetOf(history, exName) {
  for (const sess of history) {
    const ex = sess.exercises?.find(e => e.name === exName);
    if (ex?.sets?.length) {
      const best = ex.sets.reduce((a, b) => (parseFloat(b.weight) || 0) > (parseFloat(a.weight) || 0) ? b : a);
      return { date: sess.date, ...best };
    }
  }
  return null;
}

function ExerciseCard({ name, index, sets, expanded, onToggle, onUpdate, onAdd, onRemove, onBump, lastSet }) {
  const filled = sets.filter(s => s.weight || s.reps).length;
  const currentMax = Math.max(...sets.map(s => parseFloat(s.weight) || 0));
  const isPB = currentMax > 0 && (parseFloat(lastSet?.weight) || 0) > 0 && currentMax > parseFloat(lastSet.weight);
  return (
    <div className="mw-card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
        <div className="mw-mono" style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-mute)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{String(index + 1).padStart(2, '0')}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
          {lastSet && !expanded && <div className="mw-mute" style={{ fontSize: 11, marginTop: 1 }}>last: {lastSet.weight}kg × {lastSet.reps}</div>}
        </div>
        {isPB && <span className="mw-chip" style={{ background: '#22c55e22', color: '#22c55e' }}>↑ PB</span>}
        {filled > 0 && <span className="mw-chip">{filled} set{filled > 1 ? 's' : ''}</span>}
        <Icon name="chevron-down" size={14} color="var(--text-mute)"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>
          <div className="mw-eyebrow" style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 8, marginBottom: 4 }}>
            <span>#</span><span>Weight (kg)</span><span>Reps</span><span/>
          </div>
          {sets.map((set, i) => (
            <div key={i}>
              <div className="mw-set-row">
                <div className="mw-mono mw-mute" style={{ fontSize: 12, textAlign: 'center' }}>{i + 1}</div>
                <input className="mw-input" inputMode="decimal" placeholder="0" value={set.weight}
                  onChange={e => onUpdate(i, 'weight', e.target.value)} style={{ direction: 'ltr', textAlign: 'center', fontFamily: 'var(--mono)' }}/>
                <input className="mw-input" inputMode="numeric" placeholder="0" value={set.reps}
                  onChange={e => onUpdate(i, 'reps', e.target.value)} style={{ direction: 'ltr', textAlign: 'center', fontFamily: 'var(--mono)' }}/>
                <button className="mw-btn mw-btn-icon" onClick={() => onRemove(i)} disabled={sets.length === 1}
                  style={{ height: 40, width: 36, opacity: sets.length === 1 ? 0.3 : 1 }}>
                  <Icon name="x" size={14} color="var(--text-mute)"/>
                </button>
              </div>
              <div className="mw-quick">
                <button onClick={() => onBump(i, 2.5)}>+2.5</button>
                <button onClick={() => onBump(i, 5)}>+5</button>
                <button onClick={() => onBump(i, -2.5)}>−2.5</button>
                <button onClick={() => onBump(i, -5)}>−5</button>
              </div>
            </div>
          ))}
          <button className="mw-btn mw-btn-ghost mw-btn-sm" onClick={onAdd} style={{ width: '100%', marginTop: 8 }}>
            <Icon name="plus" size={12}/> Add set
          </button>
        </div>
      )}
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.Dashboard = Dashboard;
window.Logger = Logger;
window.SplitPicker = SplitPicker;
window.FounderBadge = FounderBadge;
window.AvatarView = AvatarView;
