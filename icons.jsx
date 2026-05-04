// icons.jsx — minimal stroke icons

const Icon = ({ name, size = 18, color = 'currentColor', stroke = 1.75 }) => {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'plus': return <svg viewBox="0 0 24 24" {...s}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg viewBox="0 0 24 24" {...s}><path d="M5 12h14"/></svg>;
    case 'trash': return <svg viewBox="0 0 24 24" {...s}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case 'edit': return <svg viewBox="0 0 24 24" {...s}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case 'check': return <svg viewBox="0 0 24 24" {...s}><path d="M20 6 9 17l-5-5"/></svg>;
    case 'x': return <svg viewBox="0 0 24 24" {...s}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case 'arrow-left': return <svg viewBox="0 0 24 24" {...s}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case 'arrow-right': return <svg viewBox="0 0 24 24" {...s}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
    case 'chevron-down': return <svg viewBox="0 0 24 24" {...s}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevron-right': return <svg viewBox="0 0 24 24" {...s}><path d="m9 6 6 6-6 6"/></svg>;
    case 'home': return <svg viewBox="0 0 24 24" {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>;
    case 'dumbbell': return <svg viewBox="0 0 24 24" {...s}><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4-3-3M6 2L2 6l3 3M14 9l-5 5"/></svg>;
    case 'history': return <svg viewBox="0 0 24 24" {...s}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 3"/></svg>;
    case 'chart': return <svg viewBox="0 0 24 24" {...s}><path d="M3 3v18h18M7 14l4-4 4 4 5-7"/></svg>;
    case 'user': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'settings': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'flame': return <svg viewBox="0 0 24 24" {...s}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-1 2.5-2.5 0-2-2-3.5-1.5-6 .5 2 4 4.5 4 7a5.5 5.5 0 1 1-11 0c0-2 .5-3 1.5-4.5 1 1.5 1.5 2.5 2 3.5z"/></svg>;
    case 'calendar': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case 'trophy': return <svg viewBox="0 0 24 24" {...s}><path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
    case 'sync': return <svg viewBox="0 0 24 24" {...s}><path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 12a9 9 0 0 0 15 6.7L21 16M21 3v5h-5M3 21v-5h5"/></svg>;
    case 'play': return <svg viewBox="0 0 24 24" {...s}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
    case 'logout': return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'grip': return <svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>;
    case 'sparkle': return <svg viewBox="0 0 24 24" {...s}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case 'timer': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 3h6M12 3v2"/></svg>;
    case 'people': return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'sun': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
    case 'moon': return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
