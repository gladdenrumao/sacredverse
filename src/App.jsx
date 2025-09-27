import React, { useEffect, useState } from "react";

/* CONFIG */
const START_DATE_ISO = "2025-09-23"; // Change to your chosen day-1 (YYYY-MM-DD)
const STORAGE_KEY = "sacredverse_v1_progress";
const META_KEY = "sacredverse_v1_meta";

/* fallback sample content (if fetch fails) */
const fallbackContent = [
  {
    id: 1,
    title: "Greet with kindness",
    text:
      "Say a warm 'Good morning' to the watchman or helper you meet today. A small greeting brightens someone's day.",
    deeds: ["Greet one person with a smile and kind words"]
  }
];

/* --- date helpers (IST) --- */
function getISTDatePart(date = new Date()) {
  const s = date.toLocaleString("en-CA", { timeZone: "Asia/Kolkata" });
  return s.split(",")[0];
}
function istMidnightTimestampFromDatePart(datePart) {
  return Date.parse(`${datePart}T00:00:00+05:30`);
}
function computeDayIndex(startIso, entriesLength) {
  const startMid = istMidnightTimestampFromDatePart(startIso);
  const todayPart = getISTDatePart(new Date());
  const todayMid = istMidnightTimestampFromDatePart(todayPart);
  const diffDays = Math.floor((todayMid - startMid) / (24 * 3600 * 1000));
  const idx = ((diffDays % entriesLength) + entriesLength) % entriesLength;
  return idx;
}
function msUntilNextISTMidnight() {
  const now = new Date();
  const todayPart = getISTDatePart(now);
  const nextMid = new Date(istMidnightTimestampFromDatePart(todayPart) + 24 * 3600 * 1000);
  return nextMid - now;
}

/* --- meta storage helpers --- */
/*
meta shape:
{
  lastCompletedDate: "YYYY-MM-DD",
  streak: number,
  totalPoints: number,
  badges: [3,7,30] // numbers of unlocked badges
}
*/
function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || { lastCompletedDate: null, streak: 0, totalPoints: 0, badges: [] };
  } catch {
    return { lastCompletedDate: null, streak: 0, totalPoints: 0, badges: [] };
  }
}
function writeMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/* badge thresholds */
const BADGE_THRESHOLDS = [3, 7, 30];

export default function App() {
  const [content, setContent] = useState([]);
  const [todayIndex, setTodayIndex] = useState(0);
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const [meta, setMeta] = useState(() => readMeta());
  const [joyMessage, setJoyMessage] = useState(null);
  const [badgeModal, setBadgeModal] = useState(null); // {n: 3} or null
  const [showBadges, setShowBadges] = useState(false);

  /* fetch content */
  useEffect(() => {
    fetch("/content.json")
      .then((r) => {
        if (!r.ok) throw new Error("no content");
        return r.json();
      })
      .then((data) => setContent(data))
      .catch(() => setContent(fallbackContent));
  }, []);

  /* compute today index and schedule next-midnight update */
  useEffect(() => {
    if (!content || content.length === 0) return;
    const idx = computeDayIndex(START_DATE_ISO, content.length);
    setTodayIndex(idx);

    const ms = msUntilNextISTMidnight();
    const timer = setTimeout(() => {
      const newIdx = computeDayIndex(START_DATE_ISO, content.length);
      setTodayIndex(newIdx);
    }, ms + 500);

    return () => clearTimeout(timer);
  }, [content]);

  /* persist progress/meta */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    writeMeta(meta);
  }, [meta]);

  // THEME: light/dark handling
const THEME_KEY = "sacredverse_theme"; // stores 'light' or 'dark'

const [theme, setTheme] = useState(() => {
  try {
    return localStorage.getItem(THEME_KEY) || null;
  } catch {
    return null;
  }
});

// apply theme to html element
useEffect(() => {
  const html = document.documentElement;
  // remove any previous marker for system-preference-based default
  html.classList.remove("user-theme-set");
  if (theme === "dark") {
    html.classList.add("dark");
    html.classList.add("user-theme-set");
    localStorage.setItem(THEME_KEY, "dark");
  } else if (theme === "light") {
    html.classList.remove("dark");
    html.classList.add("user-theme-set");
    localStorage.setItem(THEME_KEY, "light");
  } else {
    // no explicit user choice — respect system; don't set user-theme-set
    localStorage.removeItem(THEME_KEY);
  }
}, [theme]);

  /* helpers */
  function computeTotalPoints(prog) {
    let sum = 0;
    Object.values(prog || {}).forEach((dayObj) => {
      if (!dayObj) return;
      sum += Object.values(dayObj).filter(Boolean).length;
    });
    return sum;
  }
  function yesterdayOf(dateStr) {
    const base = new Date(dateStr + "T00:00:00+05:30");
    const prev = new Date(base.getTime() - 24 * 3600 * 1000);
    return getISTDatePart(prev);
  }
  function isTodayCompleted(prog, idx) {
    const d = prog && prog[idx];
    if (!d) return false;
    return Object.values(d).some(Boolean);
  }

  /* toggle deed with safe meta updates and badge logic */
  function toggleDeed(dayIdx, deedIdx) {
    setProgress((prevProgress) => {
      const copy = { ...prevProgress };
      if (!copy[dayIdx]) copy[dayIdx] = {};
      copy[dayIdx][deedIdx] = !copy[dayIdx][deedIdx];

      const wasCompletedBefore = Object.values(prevProgress[dayIdx] || {}).some(Boolean);
      const nowCompleted = Object.values(copy[dayIdx] || {}).some(Boolean);

      const newTotalPoints = computeTotalPoints(copy);

      // update meta safely using setMeta functional form
      setMeta((prevMeta) => {
        const newMeta = { ...prevMeta, totalPoints: newTotalPoints };
        const todayDatePart = getISTDatePart(new Date());

        // only when transitioning from not-completed => completed
        if (!wasCompletedBefore && nowCompleted) {
          const lastDate = newMeta.lastCompletedDate;
          if (lastDate && lastDate === yesterdayOf(todayDatePart)) {
            newMeta.streak = (newMeta.streak || 0) + 1;
          } else {
            newMeta.streak = 1;
          }
          newMeta.lastCompletedDate = todayDatePart;

          // badge check: if streak now equals a threshold not yet in badges -> unlock
          const newlyEarned = BADGE_THRESHOLDS.filter((t) => newMeta.streak === t && !(newMeta.badges || []).includes(t));
          if (newlyEarned.length > 0) {
            // add badge(s)
            newMeta.badges = Array.from(new Set([...(newMeta.badges || []), ...newlyEarned]));
            // show the first badge modal (usually one)
            setBadgeModal(newlyEarned[0]);
          }
        }

        // friendly UX: do not decrement streak on uncheck
        return newMeta;
      });

      return copy;
    });

    setJoyMessage("Lovely — you did a good thing! 🌟");
    setTimeout(() => setJoyMessage(null), 1500);
  }

  /* Share helpers */
  function shareToday() {
    const today = content[todayIndex];
    if (!today) return;

    const text = `${today.title}\n\n${today.text}\n\nDeed: ${today.deeds[0]}\n\n— via SacredVerse`;
    const url = window.location.href;

    // Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: `SacredVerse — Day ${todayIndex + 1}`,
          text,
          url
        })
        .catch(() => {
          // ignore if user cancels
        });
      return;
    }

    // fallback: WhatsApp link
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
    // open small window
    window.open(whatsapp, "_blank");
  }

  async function copyTodayText() {
    const today = content[todayIndex];
    if (!today) return;
    const text = `${today.title}\n\n${today.text}\n\nDeed: ${today.deeds[0]}\n\n— via SacredVerse`;
    try {
      await navigator.clipboard.writeText(text);
      setJoyMessage("Copied to clipboard ✅");
      setTimeout(() => setJoyMessage(null), 1500);
    } catch {
      setJoyMessage("Copy failed — try share button");
      setTimeout(() => setJoyMessage(null), 1500);
    }
  }

  /* reset demo helpers (not shown in UI) */
  function resetAllLocalData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    location.reload();
  }

  if (content.length === 0) {
    return <div className="wrap">Loading…</div>;
  }

  const today = content[todayIndex];
  const totalDoneToday = progress[todayIndex] ? Object.values(progress[todayIndex]).filter(Boolean).length : 0;

  return (
    <div className="wrap">
      <div className="card">
        {/* Header */}
        <header className="header">
          <div className="brand" style={{ alignItems: "center" }}>
            <div className="logo-round" aria-hidden>
              SV
            </div>
            <div>
              <div className="title">SacredVerse</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Daily kindness in small steps</div>
            </div>
          </div>

          <div className="meta" style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Day <strong style={{ color: "var(--text)", fontWeight: 700 }}>{todayIndex + 1}</strong> / {content.length}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Good Points: <strong style={{ color: "var(--green-500)" }}>{totalDoneToday}</strong>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                🔥 Streak: <strong style={{ color: "var(--green-500)" }}>{meta.streak || 0}</strong>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                ✨ Total: <strong style={{ color: "var(--green-500)" }}>{meta.totalPoints || 0}</strong>
              </div>
            </div>
          </div>
          {/* Badges button */}
          <button
            className="secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowBadges(true)}
            aria-label="Show badges"
          >
            🏅 Badges
          </button>
          
          {/* Theme toggle */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="theme-toggle"
              aria-label="Toggle theme"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              title="Toggle light/dark"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zm10.45 0l1.8-1.79 1.79 1.79-1.79 1.8-1.8-1.8zM12 5a1 1 0 110-2 1 1 0 010 2zm0 16a1 1 0 110-2 1 1 0 010 2zm7-7a1 1 0 110-2 1 1 0 010 2zM4 12a1 1 0 110-2 1 1 0 010 2zm13.24 6.16l1.8 1.79 1.79-1.79-1.79-1.8-1.8 1.8zM6.76 19.16l-1.79 1.79 1.79 1.8 1.8-1.8-1.8-1.79z"/></svg>
              )}
            </button>
          </div>

        </header>

        {/* Main content + deeds */}
        <main className="content">
          <section className="mainText">
            <h2 className="headline">{today.title}</h2>
            <p className="copy">{today.text}</p>

            {/* share / actions row */}
            <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <button className="secondary" onClick={shareToday} aria-label="Share today">
                Share
              </button>
              <button className="secondary" onClick={copyTodayText} aria-label="Copy today">
                Copy
              </button>
            </div>
          </section>

          <aside className="deeds">
            {today.deeds.map((d, i) => {
              const checked = progress[todayIndex] && progress[todayIndex][i];
              return (
                <div key={i} className="deed-row">
                  <button
                    className={`deed-btn ${checked ? "checked" : ""}`}
                    onClick={() => toggleDeed(todayIndex, i)}
                    aria-pressed={!!checked}
                  >
                    <span className="dot" aria-hidden></span>
                    {checked ? "✓ Done" : "Mark done"}
                  </button>
                  <div className="deed-text">{d}</div>
                </div>
              );
            })}
          </aside>
        </main>

        {/* Joy message / footer */}
        <footer className="footer">
          {joyMessage && (
            <div className="joy" role="status" aria-live="polite">
              {joyMessage}
            </div>
          )}
          <small className="note">Small actions. Big kindness.</small>
        </footer>
      </div>

      {/* Badge modal (simple & dismissible) */}
      {badgeModal && (
        <div className="badge-overlay" role="dialog" aria-modal="true">
          <div className="badge-card">
            <div className="badge-emoji">🏅</div>
            <h3>Nice — {badgeModal}-day streak!</h3>
            <p>You’ve completed good deeds {badgeModal} days in a row. Keep going — small steps build habit.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                className="primary"
                onClick={() => {
                  // close modal
                  setBadgeModal(null);
                }}
              >
                Sweet!
              </button>
              <button
                className="secondary"
                onClick={() => {
                  // close modal and share the achievement
                  setBadgeModal(null);
                  // share a short achievement message
                  const shareText = `I just earned a ${badgeModal}-day kindness streak on SacredVerse 🌱 — small daily deeds, big heart.`;
                  if (navigator.share) {
                    navigator.share({ title: "SacredVerse", text: shareText, url: window.location.href }).catch(() => {});
                  } else {
                    const wa = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + window.location.href)}`;
                    window.open(wa, "_blank");
                  }
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Badges panel/modal */}
      {showBadges && (
        <div className="badge-overlay" role="dialog" aria-modal="true">
          <div className="badge-card" style={{ maxWidth: 520 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: 0 }}>Your Badges</h3>
              <button className="secondary" onClick={() => setShowBadges(false)} aria-label="Close badges">Close</button>
            </div>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {BADGE_THRESHOLDS.map((t) => {
                const unlocked = (meta.badges || []).includes(t);
                return (
                  <div key={t} className={`badge-tile ${unlocked ? "unlocked" : "locked"}`} style={{ padding: 12, borderRadius: 12, textAlign: "center", background: unlocked ? "linear-gradient(90deg,var(--green-300),var(--green-400))" : "transparent", color: unlocked ? "white" : "var(--muted)", border: unlocked ? "0" : "1px solid rgba(15,23,36,0.06)" }}>
                    <div style={{ fontSize: 28 }}>{unlocked ? "🏅" : "🔒"}</div>
                    <div style={{ fontWeight: 700, marginTop: 8 }}>{t}-day streak</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>{unlocked ? "Unlocked — nice!" : `Complete ${t} days in a row`}</div>
                    {unlocked && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
                        <button className="secondary" onClick={() => {
                          const shareText = `I earned a ${t}-day kindness streak on SacredVerse 🌱 — small daily deeds, big heart.`;
                          if (navigator.share) {
                            navigator.share({ title: "SacredVerse", text: shareText, url: window.location.href }).catch(()=>{});
                          } else {
                            const wa = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + window.location.href)}`;
                            window.open(wa, "_blank");
                          }
                        }}>Share</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14, textAlign: "center" }}>
              <small style={{ color: "var(--muted)" }}>Badges are stored on this device. Sign-in coming soon to sync across devices.</small>
            </div>
          </div>
        </div>
      )}


      {/* dev helper: reset (hidden behind keyboard shortcut or remove in production) */}
      {/* For safety, we won't render a visible reset control. Use console: window.appResetMeta() */}
    </div>
  );
}
