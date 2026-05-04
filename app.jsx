// app.jsx — main App, mobile shell, desktop shell

const { useState: useS, useEffect: useE, useMemo: useM } = React;

function colorFromName(name) {
  const palette = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}
function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useAppState() {
  const [authUser, setAuthUser] = useS(null);
  const [loading, setLoading] = useS(true);
  const [name, setName] = useS('');
  const [splits, setSplits] = useS({});
  const [history, setHistory] = useS([]);

  useE(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (!user) { setSplits({}); setHistory([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useE(() => {
    if (!authUser) return;
    setLoading(true);
    fetchUserData(authUser.id).then(d => {
      setName(d.name);
      setSplits(d.splits || defaultUserSplits());
      setHistory(d.history || []);
      setLoading(false);
    });
  }, [authUser?.id]);

  const updateSplits = (next) => {
    setSplits(next);
    if (authUser) pushUserSplits(authUser.id, next);
  };

  const saveSession = (splitId, exercises) => {
    const dateStr = todayStr();
    const existing = history.find(h => h.date === dateStr && h.day === splitId);
    let next;
    if (existing) {
      // merge
      const exMap = new Map(existing.exercises.map(e => [e.name, e]));
      exercises.forEach(e => exMap.set(e.name, e));
      const merged = { ...existing, exercises: [...exMap.values()] };
      next = history.map(h => h.id === existing.id ? merged : h);
    } else {
      next = [{ id: makeId(), date: dateStr, day: splitId, exercises }, ...history];
    }
    setHistory(next);
    if (authUser) pushUserHistory(authUser.id, next);
  };

  const deleteSession = (id) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    if (authUser) pushUserHistory(authUser.id, next);
  };

  const toggleSplit = (id, added) => {
    updateSplits({ ...splits, [id]: { ...splits[id], added } });
  };

  const activeUser = (authUser && name) ? {
    id: authUser.id, name,
    initials: initialsOf(name), color: colorFromName(name),
    sessionCount: history.length,
  } : null;

  return {
    loading, activeUser, splits, history,
    login: authSignIn, signup: authSignUp, logout: authSignOut,
    updateSplits, saveSession, deleteSession, toggleSplit,
  };
}

// ─────────── Mobile Shell ───────────
function MobileApp({ theme, density, accentHue, onToggleTheme }) {
  const app = useAppState();
  const [route, setRoute] = useS({ name: 'dashboard' });

  useE(() => { if (!app.activeUser) setRoute({ name: 'login' }); else if (route.name === 'login') setRoute({ name: 'dashboard' }); }, [app.activeUser]);

  const themeStyle = useM(() => ({ '--accent-hue': accentHue }), [accentHue]);

  if (app.loading) {
    return (
      <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mw-spinner" style={{ width: 32, height: 32 }}/>
      </div>
    );
  }
  if (!app.activeUser) {
    return (
      <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%', ...themeStyle }}>
        <LoginScreen onLogin={app.login} onSignUp={app.signup}/>
      </div>
    );
  }

  let body;
  if (route.name === 'dashboard') {
    body = <Dashboard user={app.activeUser} splits={app.splits} history={app.history}
      onPickSplit={(id) => setRoute({ name: 'logger', splitId: id })}
      onEditSplits={() => setRoute({ name: 'edit' })}
      onLogout={app.logout}
      onToggleSplit={app.toggleSplit}
      onToggleTheme={onToggleTheme}
      theme={theme}
      onGo={(n) => setRoute({ name: n })}/>;
  } else if (route.name === 'logger') {
    const split = app.splits[route.splitId];
    body = <Logger split={split} history={app.history}
      onBack={() => setRoute({ name: 'dashboard' })}
      onSave={(exs) => { app.saveSession(route.splitId, exs); }}
      onEditSplit={() => setRoute({ name: 'edit' })}/>;
  } else if (route.name === 'edit') {
    body = <EditSplits splits={app.splits} onSave={app.updateSplits} onBack={() => setRoute({ name: 'dashboard' })}/>;
  } else if (route.name === 'history') {
    body = <History history={app.history} splits={app.splits} onBack={() => setRoute({ name: 'dashboard' })} onDelete={app.deleteSession}/>;
  } else if (route.name === 'progress') {
    body = <Progress history={app.history} splits={app.splits} onBack={() => setRoute({ name: 'dashboard' })}/>;
  } else if (route.name === 'social') {
    body = <SocialScreen currentUser={app.activeUser}/>;
  }

  const showTabs = ['dashboard', 'history', 'progress', 'social'].includes(route.name);

  return (
    <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', ...themeStyle }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{body}</div>
      {showTabs && (
        <div className="mw-tabbar">
          <button className={`mw-tab ${route.name === 'dashboard' ? 'active' : ''}`} onClick={() => setRoute({ name: 'dashboard' })}>
            <Icon name="home" size={18}/>HOME
          </button>
          <button className={`mw-tab ${route.name === 'history' ? 'active' : ''}`} onClick={() => setRoute({ name: 'history' })}>
            <Icon name="history" size={18}/>LOG
          </button>
          <button className={`mw-tab ${route.name === 'progress' ? 'active' : ''}`} onClick={() => setRoute({ name: 'progress' })}>
            <Icon name="chart" size={18}/>VOLUME
          </button>
          <button className={`mw-tab ${route.name === 'social' ? 'active' : ''}`} onClick={() => setRoute({ name: 'social' })}>
            <Icon name="people" size={18}/>FRIENDS
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────── Desktop Shell ───────────
function DesktopApp({ theme, density, onToggleTheme }) {
  const app = useAppState();
  const [route, setRoute] = useS({ name: 'dashboard' });

  useE(() => { if (!app.activeUser) setRoute({ name: 'login' }); else if (route.name === 'login') setRoute({ name: 'dashboard' }); }, [app.activeUser]);

  if (app.loading) {
    return (
      <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mw-spinner" style={{ width: 40, height: 40 }}/>
      </div>
    );
  }
  if (!app.activeUser) {
    return (
      <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden' }}>
          <LoginScreen onLogin={app.login} onSignUp={app.signup}/>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'progress', label: 'Volume', icon: 'chart' },
    { id: 'social', label: 'Friends', icon: 'people' },
    { id: 'edit', label: 'Edit splits', icon: 'edit' },
  ];

  const splitsList = SPLIT_ORDER.map(id => app.splits[id]).filter(Boolean);
  Object.values(app.splits).forEach(s => { if (!SPLIT_ORDER.includes(s.id)) splitsList.push(s); });

  return (
    <div className="mw-root" data-theme={theme} data-density={density} style={{ height: '100%' }}>
      <div className="mw-desktop-shell">
        <aside className="mw-side">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="dumbbell" size={16} color="white"/>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }} className="mw-grad-text">MyWorkout</div>
            <button className="mw-btn mw-btn-icon" onClick={onToggleTheme} style={{ width: 28, height: 28 }} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} color="var(--text-mute)"/>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 14, background: 'var(--surface-2)', borderRadius: 10 }}>
            <div className="mw-avatar-sm" style={{ width: 28, height: 28, fontSize: 11, background: app.activeUser.color }}>{app.activeUser.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.activeUser.name}</div>
              <div className="mw-mute" style={{ fontSize: 10 }}>{app.history.length} sessions</div>
            </div>
            <button className="mw-btn mw-btn-icon" onClick={app.logout} style={{ width: 26, height: 26 }}>
              <Icon name="logout" size={11} color="var(--text-mute)"/>
            </button>
          </div>

          {navItems.map(n => (
            <div key={n.id} className={`mw-side-item ${route.name === n.id ? 'active' : ''}`} onClick={() => setRoute({ name: n.id })}>
              <Icon name={n.icon} size={15}/> {n.label}
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '12px 8px 4px', borderTop: '1px solid var(--border)' }}>
            <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Quick start</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {splitsList.slice(0, 6).map(s => (
                <button key={s.id} className="mw-side-item" style={{ padding: '6px 10px' }}
                  onClick={() => setRoute({ name: 'logger', splitId: s.id })}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: (s.color || '#6366f1') + '22', color: s.color || 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.icon || s.name[0]}</span>
                  <span style={{ fontSize: 12 }}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {route.name === 'dashboard' && (
            <DesktopDashboard user={app.activeUser} splits={app.splits} history={app.history}
              onPickSplit={(id) => setRoute({ name: 'logger', splitId: id })}
              onEditSplits={() => setRoute({ name: 'edit' })}
              onToggleSplit={app.toggleSplit}
              onGo={(n) => setRoute({ name: n })}/>
          )}
          {route.name === 'logger' && (
            <Logger split={app.splits[route.splitId]} history={app.history}
              onBack={() => setRoute({ name: 'dashboard' })}
              onSave={(exs) => app.saveSession(route.splitId, exs)}
              onEditSplit={() => setRoute({ name: 'edit' })}/>
          )}
          {route.name === 'edit' && (
            <EditSplits splits={app.splits} onSave={app.updateSplits} onBack={() => setRoute({ name: 'dashboard' })}/>
          )}
          {route.name === 'history' && (
            <History history={app.history} splits={app.splits} onBack={() => setRoute({ name: 'dashboard' })} onDelete={app.deleteSession}/>
          )}
          {route.name === 'progress' && (
            <Progress history={app.history} splits={app.splits} onBack={() => setRoute({ name: 'dashboard' })}/>
          )}
          {route.name === 'social' && (
            <SocialScreen currentUser={app.activeUser}/>
          )}
        </main>
      </div>
    </div>
  );
}

function DesktopDashboard({ user, splits, history, onPickSplit, onEditSplits, onGo, onToggleSplit }) {
  const allList = SPLIT_ORDER.map(id => splits[id]).filter(Boolean);
  Object.values(splits).forEach(s => { if (!SPLIT_ORDER.includes(s.id)) allList.push(s); });
  const splitsList = allList.filter(s => s.added !== false);
  const availableList = allList.filter(s => s.added === false);
  const [showPicker, setShowPicker] = useS(false);
  const todaySessions = history.filter(h => h.date === todayStr());

  return (
    <div className="mw-scroll mw-fade-in" style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mw-eyebrow" style={{ marginBottom: 6 }}>{todayStr()}</div>
          <h1 className="mw-h1" style={{ fontSize: 30, lineHeight: 1.25, paddingBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hey <span className="mw-grad-text" style={{ paddingRight: 2 }}>{user.name}</span> — let's lift.</h1>
        </div>
        <button className="mw-btn mw-btn-primary" onClick={() => onGo('progress')} style={{ flexShrink: 0 }}>
          <Icon name="chart" size={14} color="white"/> View progress
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <div className="mw-stat">
          <div className="mw-stat-num mw-grad-text">{history.length}</div>
          <div className="mw-stat-lbl">Total Sessions</div>
        </div>
        <div className="mw-stat">
          <div className="mw-stat-num">{streakOf(history)}</div>
          <div className="mw-stat-lbl">Current Streak</div>
        </div>
        <div className="mw-stat">
          <div className="mw-stat-num">{todaySessions.length}</div>
          <div className="mw-stat-lbl">Today</div>
        </div>
        <div className="mw-stat">
          <div className="mw-stat-num">{splitsList.length}</div>
          <div className="mw-stat-lbl">Active Splits</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="mw-h2">{splitsList.length === 6 ? 'Recommended 6-day rotation' : 'Your splits'}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="mw-btn mw-btn-sm" onClick={() => setShowPicker(true)}>
                <Icon name="plus" size={12}/> Add split
              </button>
              <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={onEditSplits}>
                <Icon name="edit" size={12}/> Edit splits
              </button>
            </div>
          </div>
          <div className="mw-eyebrow" style={{ marginBottom: 10 }}>{splitsList.length} active · {availableList.length} more available</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {splitsList.map((s) => (
              <SplitCard key={s.id} split={s} sessions={history.filter(h => h.day === s.id).length}
                todayDone={todaySessions.some(t => t.day === s.id)}
                onClick={() => onPickSplit(s.id)} />
            ))}
            {splitsList.length === 0 && (
              <div className="mw-mute" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, fontSize: 13, border: '1px dashed var(--border)', borderRadius: 12 }}>
                No splits yet — click <strong>Add split</strong> to get started.
              </div>
            )}
          </div>
        </div>

        <div>
          <DesktopMuscleVolume history={history}/>
        </div>
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

function DesktopMuscleVolume({ history }) {
  const counts = useM(() => weekSetsByMuscle(history), [history]);
  const today = new Date();
  const dow = today.getDay();
  const daysLeft = (4 - dow + 7) % 7;
  const totalSets = MUSCLES.reduce((a, m) => a + (counts[m.id] || 0), 0);

  return (
    <div className="mw-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="mw-eyebrow">
            {daysLeft === 0 ? 'Resets tomorrow' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Weekly Volume</div>
        </div>
        <span className="mw-chip"><Icon name="flame" size={10}/> {totalSets}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {MUSCLES.map(m => {
          const count = counts[m.id] || 0;
          const pct = Math.min(count / m.target, 1);
          const done = count >= m.target;
          return (
            <div key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: done ? '#22c55e' : m.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>{m.label}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: done ? '#22c55e' : 'var(--text-mute)' }}>
                  {count}<span style={{ opacity: 0.5 }}>/{m.target}</span>
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: done ? '#22c55e' : m.color, borderRadius: 2, transition: 'width .4s' }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mw-mute" style={{ fontSize: 10, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        Target sets per muscle · resets Friday
      </div>
    </div>
  );
}

window.MobileApp = MobileApp;
window.DesktopApp = DesktopApp;
