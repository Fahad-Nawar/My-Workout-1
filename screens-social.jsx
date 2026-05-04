// screens-social.jsx — Friends / Social screen

const { useState: useSo, useEffect: useEo, useMemo: useMo } = React;

// ─── Main Social Screen ───
function SocialScreen({ currentUser }) {
  const [friendships, setFriendships] = useSo([]);
  const [loading, setLoading] = useSo(true);
  const [friendDataMap, setFriendDataMap] = useSo({});
  const [showAdd, setShowAdd] = useSo(false);
  const [viewFriend, setViewFriend] = useSo(null);

  const reload = async () => {
    setLoading(true);
    const fs = await fetchFriendships(currentUser.id);
    setFriendships(fs);
    const accepted = fs.filter(f => f.status === 'accepted');
    const map = {};
    await Promise.all(accepted.map(async f => {
      const fId = f.requester_id === currentUser.id ? f.addressee_id : f.requester_id;
      const d = await fetchFriendData(fId);
      if (d) map[fId] = d;
    }));
    setFriendDataMap(map);
    setLoading(false);
  };

  useEo(() => { reload(); }, [currentUser.id]);

  const accepted   = friendships.filter(f => f.status === 'accepted');
  const pendingIn  = friendships.filter(f => f.status === 'pending' && f.addressee_id === currentUser.id);
  const pendingOut = friendships.filter(f => f.status === 'pending' && f.requester_id === currentUser.id);
  const getFriendId = f => f.requester_id === currentUser.id ? f.addressee_id : f.requester_id;

  if (viewFriend) {
    return <FriendDetail friendId={viewFriend} data={friendDataMap[viewFriend]} onBack={() => setViewFriend(null)}/>;
  }

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">Social</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Friends</div>
        </div>
        <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={12} color="white"/> Add friend
        </button>
      </div>

      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="mw-spinner" style={{ width: 24, height: 24, borderColor: 'rgba(99,102,241,.3)', borderTopColor: 'var(--accent)' }}/>
          </div>
        ) : (
          <>
            {pendingIn.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Requests · {pendingIn.length}</div>
                {pendingIn.map(f => (
                  <PendingInCard key={f.id} friendship={f}
                    onAccept={async () => { await respondToRequest(f.id, true); reload(); }}
                    onDecline={async () => { await respondToRequest(f.id, false); reload(); }}/>
                ))}
              </div>
            )}

            <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Friends · {accepted.length}</div>

            {accepted.length === 0 && pendingIn.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '52px 0' }}>
                <Icon name="people" size={40} color="var(--text-mute)"/>
                <div style={{ color: 'var(--text-mute)', fontSize: 13, marginTop: 12 }}>No friends yet</div>
                <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 4 }}>Find friends by their username</div>
                <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={() => setShowAdd(true)} style={{ marginTop: 16 }}>
                  <Icon name="plus" size={12} color="white"/> Add friend
                </button>
              </div>
            ) : (
              accepted.map(f => {
                const fId = getFriendId(f);
                return (
                  <FriendCard key={f.id} friendId={fId} data={friendDataMap[fId]}
                    onClick={() => setViewFriend(fId)}
                    onRemove={async () => { await removeFriend(f.id); reload(); }}/>
                );
              })
            )}

            {pendingOut.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Sent · {pendingOut.length}</div>
                {pendingOut.map(f => (
                  <div key={f.id} className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '10px 14px' }}>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-mute)' }}>Request pending...</div>
                    <button className="mw-btn mw-btn-sm mw-btn-ghost"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={async () => { await removeFriend(f.id); reload(); }}>Cancel</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <AddFriendModal currentUserId={currentUser.id} friendships={friendships}
          onClose={() => setShowAdd(false)}
          onSent={() => { setShowAdd(false); reload(); }}/>
      )}
    </div>
  );
}

// ─── Friend Card ───
function FriendCard({ friendId, data, onClick, onRemove }) {
  const counts = useMo(() => weekSetsByMuscle(data?.history || []), [data]);
  const totalSets = MUSCLES.reduce((a, m) => a + (counts[m.id] || 0), 0);

  if (!data) {
    return (
      <div className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '12px 14px', opacity: 0.6 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--surface-2)' }}/>
        <div style={{ flex: 1, color: 'var(--text-mute)', fontSize: 13 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="mw-card" style={{ marginBottom: 10, padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarView name={data.name} avatarUrl={data.avatarUrl || ''} size={42}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{data.name}</span>
            <FounderBadge/>
          </div>
          <div className="mw-mute" style={{ fontSize: 11 }}>{(data.history || []).length} sessions · {totalSets} sets this week</div>
        </div>
        <button className="mw-btn mw-btn-icon" style={{ width: 28, height: 28 }}
          onClick={e => { e.stopPropagation(); onRemove(); }}>
          <Icon name="x" size={12} color="var(--text-mute)"/>
        </button>
      </div>
      <div style={{ padding: '6px 14px 10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 10px', borderTop: '1px solid var(--border)' }}>
        {MUSCLES.map(m => {
          const count = counts[m.id] || 0;
          const pct = Math.min(count / m.target, 1);
          const done = count >= m.target;
          return (
            <div key={m.id} style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 9, color: 'var(--text-mute)', marginBottom: 2, fontFamily: 'var(--mono)' }}>{m.label.toUpperCase().slice(0, 3)}</div>
              <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: done ? '#22c55e' : m.color, borderRadius: 2 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incoming request card ───
function PendingInCard({ friendship, onAccept, onDecline }) {
  const [data, setData] = useSo(null);
  useEo(() => {
    fetchFriendData(friendship.requester_id).then(d => { if (d) setData(d); });
  }, [friendship.requester_id]);

  return (
    <div className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '12px 14px' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: data ? colorFromName(data.name) : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
        {data ? initialsOf(data.name) : '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{data ? data.name : 'Loading...'}</div>
        <div className="mw-mute" style={{ fontSize: 11 }}>Wants to be your friend</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="mw-btn mw-btn-sm" onClick={onDecline}>Decline</button>
        <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={onAccept}>Accept</button>
      </div>
    </div>
  );
}

// ─── Add Friend Modal ───
function AddFriendModal({ currentUserId, friendships, onClose, onSent }) {
  const [query, setQuery] = useSo('');
  const [results, setResults] = useSo([]);
  const [searching, setSearching] = useSo(false);
  const [sent, setSent] = useSo(new Set());

  const existingSet = useMo(() => new Set(
    friendships.map(f => f.requester_id === currentUserId ? f.addressee_id : f.requester_id)
  ), [friendships]);

  useEo(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchUsers(query)); } catch (e) { setResults([]); }
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const handleSend = async (userId) => {
    try { await sendFriendRequest(userId); setSent(s => new Set([...s, userId])); }
    catch (e) { /* duplicate or error */ }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', flexDirection: 'column' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ marginTop: 'auto', background: 'var(--surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '20px 16px 32px', maxHeight: '78%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="mw-h2">Add friend</h2>
          <button className="mw-btn mw-btn-icon" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <input className="mw-input" autoFocus placeholder="Search by username..." value={query}
          onChange={e => setQuery(e.target.value)} style={{ marginBottom: 12 }}/>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searching && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div className="mw-spinner" style={{ width: 20, height: 20, borderColor: 'rgba(99,102,241,.3)', borderTopColor: 'var(--accent)' }}/>
            </div>
          )}
          {!searching && !query && (
            <div className="mw-mute" style={{ textAlign: 'center', padding: '28px 0', fontSize: 12 }}>
              <Icon name="user" size={28} color="var(--text-mute)"/>
              <div style={{ marginTop: 8 }}>Type a username to search</div>
            </div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="mw-mute" style={{ textAlign: 'center', padding: 20, fontSize: 13 }}>No users found for "{query}"</div>
          )}
          {results.map(u => {
            const isFriend = existingSet.has(u.user_id);
            const isSent = sent.has(u.user_id);
            return (
              <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <AvatarView name={u.name} avatarUrl={u.avatarUrl || ''} size={38}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                    <FounderBadge/>
                  </div>
                </div>
                {isFriend ? (
                  <span className="mw-chip">Friends</span>
                ) : isSent ? (
                  <span className="mw-chip" style={{ background: '#22c55e22', color: '#22c55e' }}><Icon name="check" size={10}/> Sent</span>
                ) : (
                  <button className="mw-btn mw-btn-primary mw-btn-sm" onClick={() => handleSend(u.user_id)}>
                    <Icon name="plus" size={11} color="white"/> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Friend Detail ───
function FriendDetail({ friendId, data, onBack }) {
  if (!data) {
    return (
      <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mw-spinner" style={{ width: 28, height: 28 }}/>
        </div>
      </div>
    );
  }

  const history = data.history || [];

  return (
    <div className="mw-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <button className="mw-btn mw-btn-icon" onClick={onBack}><Icon name="arrow-left" size={16}/></button>
        <div style={{ flex: 1 }}>
          <div className="mw-eyebrow">Friend profile</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{data.name}</div>
        </div>
      </div>

      <div className="mw-scroll" style={{ flex: 1, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: data.bio ? 12 : 20 }}>
          <AvatarView name={data.name} avatarUrl={data.avatarUrl || ''} size={64}/>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{data.name}</span>
              <FounderBadge/>
            </div>
            <div className="mw-mute" style={{ fontSize: 12 }}>{history.length} sessions total</div>
          </div>
        </div>

        {data.bio ? (
          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-dim)' }}>{data.bio}</div>
          </div>
        ) : null}

        <MuscleVolumePanel history={history}/>

        {history.length > 0 && (
          <>
            <div className="mw-eyebrow" style={{ marginBottom: 8 }}>Recent sessions</div>
            {history.slice(0, 6).map(sess => {
              const totalSets = sess.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0;
              const splitName = data.splits?.[sess.day]?.name || sess.day;
              return (
                <div key={sess.id} className="mw-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '10px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{splitName}</div>
                    <div className="mw-mute" style={{ fontSize: 11 }}>{sess.date}</div>
                  </div>
                  <span className="mw-pill">{totalSets} sets</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

window.SocialScreen = SocialScreen;
