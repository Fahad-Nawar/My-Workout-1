// screens-2.jsx — Edit split, History, Progress

const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ────────────────────────── Edit Split ──────────────────────────
function EditSplits({ splits, onSave, onBack }) {
  const [working, setWorking] = useState2(() => JSON.parse(JSON.stringify(splits)));
  const [active, setActive] = useState2(SPLIT_ORDER[0]);
  const [showCustom, setShowCustom] = useState2(false);

  const save = () => { onSave(working); onBack(); };
  const list = Object.values(working);
  const cur = working[active];

  const addExercise = (name) => {
    if (!cur || cur.exercises.includes(name)) return;
    setWorking(w => ({ ...w, [active]: { ...w[active], exercises: [...w[active].exercises, name] } }));
  };
  const removeExercise = (name) => {
    setWorking(w => ({ ...w, [active]: { ...w[active], exercises: w[active].exercises.filter(e => e !== name) } }));
  };

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">Edit splits</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Customize your routine</div>
        </div>
        <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={save}>
          <Icon name="check" size={12} color="white"/> Save
        </button>
      </div>

      {/* Split tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
        {list.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className="mw-btn mw-btn-sm"
            style={{
              flex: 'none',
              background: active === s.id ? 'var(--accent-soft)' : 'var(--surface)',
              color: active === s.id ? 'var(--accent)' : 'var(--text-dim)',
              borderColor: active === s.id ? 'var(--accent)' : 'var(--border)',
            }}>{s.name}</button>
        ))}
        <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => setShowCustom(true)} style={{ flex: 'none' }}>
          <Icon name="plus" size={12}/> Custom
        </button>
      </div>

      {cur && (
        <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
          <div className="mw-eyebrow" style={{ marginBottom: 8 }}>In this split · {cur.exercises.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {cur.exercises.length === 0 && (
              <div className="mw-mute" style={{ fontSize: 12, padding: 12, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
                No exercises yet — add some below.
              </div>
            )}
            {cur.exercises.map((ex, i) => (
              <div key={ex} className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                <div className="mw-mono mw-mute" style={{ fontSize: 11, width: 16 }}>{i + 1}</div>
                <Icon name="grip" size={14} color="var(--text-mute)"/>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{ex}</div>
                <button className="mw-btn mw-btn-icon" onClick={() => removeExercise(ex)} style={{ width: 30, height: 30 }}>
                  <Icon name="trash" size={13} color="var(--danger)"/>
                </button>
              </div>
            ))}
          </div>

          <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Add from library</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXERCISE_POOL.filter(e => !cur.exercises.includes(e)).map(ex => (
              <button key={ex} className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => addExercise(ex)}>
                <Icon name="plus" size={11} color="var(--text-dim)"/> {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCustom && (
        <CustomSplitModal onClose={() => setShowCustom(false)} onCreate={(s) => {
          setWorking(w => ({ ...w, [s.id]: s }));
          setActive(s.id);
          setShowCustom(false);
        }}/>
      )}
    </div>
  );
}

function CustomSplitModal({ onClose, onCreate }) {
  const [name, setName] = useState2('');
  const [picked, setPicked] = useState2([]);
  const create = () => {
    if (!name.trim() || picked.length === 0) return;
    onCreate({
      id: 'custom_' + Date.now(),
      name: name.trim(),
      subtitle: 'Custom',
      icon: name.trim()[0].toUpperCase(),
      color: '#ec4899',
      exercises: picked,
    });
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', flexDirection: 'column' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ marginTop: 'auto', background: 'var(--surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '20px 16px 24px', maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }}/>
        <h2 className="mw-h2" style={{ marginBottom: 4 }}>New custom split</h2>
        <p className="mw-mute" style={{ fontSize: 12, marginBottom: 16 }}>Build a routine just for you.</p>
        <input className="mw-input" autoFocus placeholder="Split name (e.g. Arms Day)" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 14 }}/>
        <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Pick exercises · {picked.length}</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 12 }}>
          {EXERCISE_POOL.map(ex => {
            const on = picked.includes(ex);
            return (
              <button key={ex} className="mw-btn mw-btn-sm" onClick={() => setPicked(p => on ? p.filter(x => x !== ex) : [...p, ex])}
                style={{
                  background: on ? 'var(--accent)' : 'var(--surface-2)',
                  color: on ? 'white' : 'var(--text-dim)',
                  border: on ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}>
                {on && <Icon name="check" size={11} color="white"/>} {ex}
              </button>
            );
          })}
        </div>
        <button className="mw-btn mw-btn-primary" onClick={create} disabled={!name.trim() || !picked.length}
          style={{ marginTop: 12, opacity: (name.trim() && picked.length) ? 1 : 0.5 }}>
          Create split
        </button>
      </div>
    </div>
  );
}

// ────────────────────────── History ──────────────────────────
function History({ history, splits, onBack, onDelete }) {
  const [openId, setOpenId] = useState2(null);
  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">History</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{history.length} sessions</div>
        </div>
      </div>
      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        {history.length === 0 && (
          <div className="mw-mute" style={{ textAlign: 'center', padding: 40, fontSize: 13 }}>
            <Icon name="history" size={32} color="var(--text-mute)"/>
            <div style={{ marginTop: 8 }}>No sessions yet — log your first workout!</div>
          </div>
        )}
        {history.map(sess => {
          const split = splits[sess.day];
          const totalSets = sess.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0;
          const open = openId === sess.id;
          return (
            <div key={sess.id} className="mw-card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(open ? null : sess.id)} style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (split?.color || '#6366f1') + '22', color: split?.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 13 }}>{split?.icon || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{split?.name || sess.day}</div>
                  <div className="mw-mute" style={{ fontSize: 11 }}>{sess.date}</div>
                </div>
                <span className="mw-pill">{totalSets} sets</span>
                <Icon name="chevron-down" size={14} color="var(--text-mute)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
              </button>
              {open && (
                <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)' }}>
                  {sess.exercises?.map(e => (
                    <div key={e.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{e.name}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {e.sets?.map((s, i) => (
                          <span key={i} className="mw-pill">{s.weight || '–'}kg × {s.reps || '–'}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => onDelete(sess.id)}
                    style={{ marginTop: 10, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                    <Icon name="trash" size={11} color="var(--danger)"/> Delete session
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────── Muscle Volume Panel ──────────────────────────
function MuscleVolumePanel({ history }) {
  const counts = useMemo2(() => weekSetsByMuscle(history), [history]);
  const today = new Date();
  const dow = today.getDay();
  const daysLeft = dow === 0 ? 0 : 7 - dow;

  return (
    <div className="mw-card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="mw-eyebrow">
            Mon – Sun · {daysLeft === 0 ? 'Resets tomorrow' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          </div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Weekly Volume</div>
        </div>
        <Icon name="flame" size={18} color="var(--accent)"/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MUSCLES.map(m => {
          const count = counts[m.id] || 0;
          const pct = Math.min(count / m.target, 1);
          const done = count >= m.target;
          return (
            <div key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? '#22c55e' : m.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: done ? '#22c55e' : 'var(--text)', fontWeight: 700 }}>{count}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--mono)' }}>/ {m.target}</span>
                  {done && <span className="mw-chip" style={{ background: '#22c55e22', color: '#22c55e', fontSize: 9, padding: '2px 6px' }}>done</span>}
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: done ? '#22c55e' : m.color, borderRadius: 3, transition: 'width .4s' }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mw-mute" style={{ fontSize: 11, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        Weekly minimum sets per muscle. Resets every Monday.
      </div>
    </div>
  );
}

// ────────────────────────── Progress (chart) ──────────────────────────
function Progress({ history, splits, onBack }) {
  const allExercises = useMemo2(() => {
    const set = new Set();
    history.forEach(h => h.exercises?.forEach(e => set.add(e.name)));
    return [...set];
  }, [history]);

  const [picked, setPicked] = useState2(allExercises[0] || '');
  useEffect2(() => { if (!picked && allExercises[0]) setPicked(allExercises[0]); }, [allExercises]);

  const dataPoints = useMemo2(() => {
    return history
      .filter(h => h.exercises?.some(e => e.name === picked))
      .map(h => {
        const ex = h.exercises.find(e => e.name === picked);
        const maxW = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0), 0);
        const totalReps = ex.sets.reduce((a, s) => a + (parseInt(s.reps) || 0), 0);
        return { date: h.date, maxW, totalReps };
      })
      .reverse();
  }, [history, picked]);

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">Progress</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Track your gains</div>
        </div>
      </div>

      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        <MuscleVolumePanel history={history}/>
        {allExercises.length === 0 ? (
          <div className="mw-mute" style={{ textAlign: 'center', padding: 40, fontSize: 13 }}>
            <Icon name="chart" size={32} color="var(--text-mute)"/>
            <div style={{ marginTop: 8 }}>Log a session to see your exercise progress.</div>
          </div>
        ) : (
          <>
            <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Exercise</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {allExercises.map(ex => (
                <button key={ex} className="mw-btn mw-btn-sm"
                  onClick={() => setPicked(ex)}
                  style={{
                    background: picked === ex ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: picked === ex ? 'var(--accent)' : 'var(--text-dim)',
                    border: picked === ex ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>{ex}</button>
              ))}
            </div>

            <Chart data={dataPoints}/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
              <div className="mw-stat">
                <div className="mw-stat-num" style={{ color: 'var(--accent)' }}>{Math.max(...dataPoints.map(d => d.maxW), 0)}<span style={{ fontSize: 14, color: 'var(--text-mute)' }}> kg</span></div>
                <div className="mw-stat-lbl">Personal Best</div>
              </div>
              <div className="mw-stat">
                <div className="mw-stat-num" style={{ color: 'var(--accent-2)' }}>{dataPoints.reduce((a,d) => a + d.totalReps, 0)}</div>
                <div className="mw-stat-lbl">Total Reps</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chart({ data }) {
  if (!data.length) return <div className="mw-card mw-mute" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>No data for this exercise yet.</div>;
  const W = 320, H = 180, P = 28;
  const maxW = Math.max(...data.map(d => d.maxW), 1);
  const maxR = Math.max(...data.map(d => d.totalReps), 1);
  const xStep = data.length > 1 ? (W - 2 * P) / (data.length - 1) : 0;
  const wPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${P + i * xStep} ${H - P - (d.maxW / maxW) * (H - 2 * P)}`).join(' ');
  const rPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${P + i * xStep} ${H - P - (d.totalReps / maxR) * (H - 2 * P)}`).join(' ');
  return (
    <div className="mw-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 8, fontSize: 11 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }}/> Max kg</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 2, background: 'var(--accent-2)' }}/> Total reps</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={P} x2={W - P} y1={P + t * (H - 2 * P)} y2={P + t * (H - 2 * P)} stroke="var(--border)" strokeWidth="1"/>
        ))}
        <path d={wPath} fill="none" stroke="var(--accent)" strokeWidth="2"/>
        <path d={rPath} fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeDasharray="4 3"/>
        {data.map((d, i) => (
          <circle key={i} cx={P + i * xStep} cy={H - P - (d.maxW / maxW) * (H - 2 * P)} r="3" fill="var(--accent)"/>
        ))}
      </svg>
    </div>
  );
}

window.EditSplits = EditSplits;
window.History = History;
window.Progress = Progress;
