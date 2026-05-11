// screens-2.jsx — Edit split, History, Progress

const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ────────────────────────── Edit Split ──────────────────────────
function EditSplits({ splits, onSave, onBack }) {
  const lang = React.useContext(LangContext);
  const [working, setWorking] = useState2(() => JSON.parse(JSON.stringify(splits)));
  const [active, setActive] = useState2(SPLIT_ORDER[0]);
  const [showCustom, setShowCustom] = useState2(false);

  const save = () => { onSave(working); onBack(); };
  const list = Object.values(working);
  const cur = working[active];

  const dragItem = useRef2(null);
  const dragOver = useRef2(null);

  const addExercise = (name) => {
    if (!cur || cur.exercises.includes(name)) return;
    setWorking(w => ({ ...w, [active]: { ...w[active], exercises: [...w[active].exercises, name] } }));
  };
  const removeExercise = (name) => {
    setWorking(w => ({ ...w, [active]: { ...w[active], exercises: w[active].exercises.filter(e => e !== name) } }));
  };
  const moveExercise = (from, to) => {
    if (from === to || from == null || to == null) return;
    setWorking(w => {
      const exs = [...w[active].exercises];
      const [moved] = exs.splice(from, 1);
      exs.splice(to, 0, moved);
      return { ...w, [active]: { ...w[active], exercises: exs } };
    });
  };

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">{tr('Edit splits', lang)}</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{tr('Customize your routine', lang)}</div>
        </div>
        <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={save}>
          <Icon name="check" size={12} color="white"/> {tr('Save', lang)}
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
            }}>{tr(s.name, lang)}</button>
        ))}
        <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => setShowCustom(true)} style={{ flex: 'none' }}>
          <Icon name="plus" size={12}/> {tr('Custom', lang)}
        </button>
      </div>

      {cur && (
        <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
          <div className="mw-eyebrow" style={{ marginBottom: 8 }}>
            {lang === 'ar' ? `في هذا البرنامج · ${cur.exercises.length}` : `In this split · ${cur.exercises.length}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {cur.exercises.length === 0 && (
              <div className="mw-mute" style={{ fontSize: 12, padding: 12, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
                {tr('No exercises yet — add some below.', lang)}
              </div>
            )}
            {cur.exercises.map((ex, i) => (
              <div key={ex}
                className="mw-card"
                draggable
                onDragStart={() => { dragItem.current = i; }}
                onDragEnter={() => { dragOver.current = i; }}
                onDragOver={e => e.preventDefault()}
                onDragEnd={() => { moveExercise(dragItem.current, dragOver.current); dragItem.current = null; dragOver.current = null; }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'grab', userSelect: 'none' }}>
                <div className="mw-mono mw-mute" style={{ fontSize: 11, width: 16 }}>{i + 1}</div>
                <Icon name="grip" size={14} color="var(--text-mute)"/>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{tr(ex, lang)}</div>
                <button className="mw-btn mw-btn-icon" onClick={() => removeExercise(ex)} style={{ width: 30, height: 30 }}>
                  <Icon name="trash" size={13} color="var(--danger)"/>
                </button>
              </div>
            ))}
          </div>

          <div className="mw-eyebrow" style={{ marginBottom: 8 }}>{tr('Add from library', lang)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXERCISE_POOL.filter(e => !cur.exercises.includes(e)).map(ex => (
              <button key={ex} className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => addExercise(ex)}>
                <Icon name="plus" size={11} color="var(--text-dim)"/> {tr(ex, lang)}
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
function exportHistoryToExcel(history, splits) {
  // Deduplicate by ID, then merge sessions sharing the same date+split
  const seenIds = new Set();
  const sessionMap = new Map();
  history.forEach(sess => {
    if (seenIds.has(sess.id)) return;
    seenIds.add(sess.id);
    const key = `${sess.date}__${sess.day}`;
    if (sessionMap.has(key)) {
      const existing = sessionMap.get(key);
      const exMap = new Map(existing.exercises.map(e => [e.name, e]));
      (sess.exercises || []).forEach(e => { if (!exMap.has(e.name)) exMap.set(e.name, e); });
      existing.exercises = [...exMap.values()];
    } else {
      sessionMap.set(key, { ...sess, exercises: [...(sess.exercises || [])] });
    }
  });

  const rows = [];
  const merges = [];
  let rowIndex = 1; // row 0 is the header

  [...sessionMap.values()].forEach(sess => {
    const splitName = splits[sess.day]?.name || sess.day;
    const sessionStart = rowIndex;
    sess.exercises.forEach(ex => {
      const exStart = rowIndex;
      ex.sets?.forEach((set, i) => {
        rows.push({
          Date: sess.date,
          Split: splitName,
          Exercise: ex.name,
          Set: i + 1,
          'Weight (kg)': set.weight || '',
          Reps: set.reps || '',
        });
        rowIndex++;
      });
      const exEnd = rowIndex - 1;
      if (exEnd > exStart) {
        merges.push({ s: { r: exStart, c: 2 }, e: { r: exEnd, c: 2 } }); // Exercise
      }
    });
    const sessionEnd = rowIndex - 1;
    if (sessionEnd > sessionStart) {
      merges.push({ s: { r: sessionStart, c: 0 }, e: { r: sessionEnd, c: 0 } }); // Date
      merges.push({ s: { r: sessionStart, c: 1 }, e: { r: sessionEnd, c: 1 } }); // Split
    }
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  if (merges.length) ws['!merges'] = merges;

  const border = {
    top:    { style: 'thin', color: { rgb: 'BDBDBD' } },
    bottom: { style: 'thin', color: { rgb: 'BDBDBD' } },
    left:   { style: 'thin', color: { rgb: 'BDBDBD' } },
    right:  { style: 'thin', color: { rgb: 'BDBDBD' } },
  };

  const headerStyle = {
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '3B4A6B' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };
  const dateStyle = {
    font: { bold: true, sz: 10, color: { rgb: '2D3561' } },
    fill: { fgColor: { rgb: 'E8EAF6' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border,
  };
  const splitStyle = {
    font: { bold: true, sz: 10, color: { rgb: '2D3561' } },
    fill: { fgColor: { rgb: 'E8EAF6' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };
  const exerciseStyle = {
    font: { bold: true, sz: 10 },
    fill: { fgColor: { rgb: 'F5F5F5' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };
  const dataStyle = {
    font: { sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border,
  };

  const totalRows = rows.length + 1;

  // Header row
  ['A1','B1','C1','D1','E1','F1'].forEach(ref => { if (ws[ref]) ws[ref].s = headerStyle; });

  // Data rows
  for (let r = 2; r <= totalRows; r++) {
    if (ws[`A${r}`]) ws[`A${r}`].s = dateStyle;
    if (ws[`B${r}`]) ws[`B${r}`].s = splitStyle;
    if (ws[`C${r}`]) ws[`C${r}`].s = exerciseStyle;
    if (ws[`D${r}`]) ws[`D${r}`].s = dataStyle;
    if (ws[`E${r}`]) ws[`E${r}`].s = dataStyle;
    if (ws[`F${r}`]) ws[`F${r}`].s = dataStyle;
  }

  // Column widths & row heights
  ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 26 }, { wch: 6 }, { wch: 13 }, { wch: 7 }];
  ws['!rows'] = [{ hpt: 26 }, ...Array(rows.length).fill({ hpt: 18 })];

  // Page layout — A4, portrait
  ws['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  ws['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Workout History');
  XLSX.writeFile(wb, 'workout-history.xlsx');
}

function History({ history, splits, onBack, onDelete }) {
  const lang = React.useContext(LangContext);
  const [openId, setOpenId] = useState2(null);
  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name={lang === 'ar' ? 'arrow-right' : 'arrow-left'} size={16}/></button>
        <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div className="mw-eyebrow">{tr('History', lang)}</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {lang === 'ar' ? `${history.length} جلسة` : `${history.length} sessions`}
          </div>
        </div>
        {history.length > 0 && (
          <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => exportHistoryToExcel(history, splits)}
            style={{ flexShrink: 0 }}>
            <Icon name="download" size={12}/> {tr('Export to Excel', lang)}
          </button>
        )}
      </div>
      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        {history.length === 0 && (
          <div className="mw-mute" style={{ textAlign: 'center', padding: 40, fontSize: 13 }}>
            <Icon name="history" size={32} color="var(--text-mute)"/>
            <div style={{ marginTop: 8 }}>{tr('No sessions yet — log your first workout!', lang)}</div>
          </div>
        )}
        {history.map(sess => {
          const split = splits[sess.day];
          const totalSets = sess.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0;
          const open = openId === sess.id;
          return (
            <div key={sess.id} className="mw-card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(open ? null : sess.id)} style={{ width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (split?.color || '#6366f1') + '22', color: split?.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 13, flexShrink: 0 }}>{split?.icon || '?'}</div>
                <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{tr(split?.name || sess.day, lang)}</div>
                  <div className="mw-mute" style={{ fontSize: 11 }}>{sess.date}</div>
                </div>
                <span className="mw-pill">{lang === 'ar' ? `${totalSets} مجموعة` : `${totalSets} sets`}</span>
                <Icon name="chevron-down" size={14} color="var(--text-mute)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
              </button>
              {open && (
                <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)' }}>
                  {sess.exercises?.map(e => (
                    <div key={e.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{tr(e.name, lang)}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {e.sets?.map((s, i) => (
                          <span key={i} className="mw-pill">{s.weight || '–'}kg × {s.reps || '–'}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="mw-btn mw-btn-sm mw-btn-ghost" onClick={() => onDelete(sess.id)}
                    style={{ marginTop: 10, color: 'var(--danger)', borderColor: 'var(--danger)', alignSelf: lang === 'ar' ? 'flex-end' : 'flex-start', display: 'flex' }}>
                    <Icon name="trash" size={11} color="var(--danger)"/> {tr('Delete session', lang)}
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
  const lang = React.useContext(LangContext);
  const counts = useMemo2(() => weekSetsByMuscle(history), [history]);
  const today = new Date();
  const dow = today.getDay();
  const daysLeft = (4 - dow + 7) % 7; // 0 on Thu (resets tomorrow = Fri), 6 on Fri

  return (
    <div className="mw-card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="mw-eyebrow">
            {lang === 'ar'
              ? `الجمعة – الخميس · ${daysLeft === 0 ? 'يعاد غداً' : `${daysLeft} يوم متبقي`}`
              : `Fri – Thu · ${daysLeft === 0 ? 'Resets tomorrow' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}`}
          </div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{tr('Weekly Volume', lang)}</div>
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
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tr(m.label, lang)}</span>
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
        {tr('Weekly minimum sets per muscle. Resets every Friday.', lang)}
      </div>
    </div>
  );
}

// ────────────────────────── Progress ──────────────────────────
function Progress({ history, splits, onBack }) {
  const lang = React.useContext(LangContext);
  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">{tr('Progress', lang)}</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{tr('Weekly Volume', lang)}</div>
        </div>
      </div>

      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        <MuscleVolumePanel history={history}/>
      </div>
    </div>
  );
}


window.EditSplits = EditSplits;
window.History = History;
window.Progress = Progress;
window.MuscleVolumePanel = MuscleVolumePanel;
