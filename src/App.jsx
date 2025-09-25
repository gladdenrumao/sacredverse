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
  },
  {
    id: 2,
    title: "Call home",
    text: "Call a parent or elder and tell them you love them. It takes 30 seconds.",
    deeds: ["Call and say 'I love you' or ask how they are"]
  }
];

function getISTDatePart(date = new Date()) {
  // returns "YYYY-MM-DD" for the given date in Asia/Kolkata timezone
  const s = date.toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD, HH:MM:SS"
  return s.split(",")[0];
}

function istMidnightTimestampFromDatePart(datePart) {
  // datePart: "YYYY-MM-DD"
  // Construct explicit IST offset timestamp
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
  const todayPart = getISTDatePart(now); // "YYYY-MM-DD"
  const nextMid = new Date(istMidnightTimestampFromDatePart(todayPart) + 24 * 3600 * 1000);
  return nextMid - now;
}

/* --- helper: meta storage --- */
/*
meta shape:
{
  lastCompletedDate: "YYYY-MM-DD", // the most recent IST date when user completed at least one deed
  streak: number,                  // consecutive days count
  totalPoints: number              // total completed deed marks across all time (per-device)
}
*/

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || { lastCompletedDate: null, streak: 0, totalPoints: 0 };
  } catch {
    return { lastCompletedDate: null, streak: 0, totalPoints: 0 };
  }
}
function writeMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

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

  // fetch content.json
  useEffect(() => {
    fetch("/content.json")
      .then((r) => {
        if (!r.ok) throw new Error("no content");
        return r.json();
      })
      .then((data) => setContent(data))
      .catch(() => setContent(fallbackContent));
  }, []);

  // compute today index once content is loaded
  useEffect(() => {
    if (!content || content.length === 0) return;
    const idx = computeDayIndex(START_DATE_ISO, content.length);
    setTodayIndex(idx);

    // schedule auto-refresh at next IST midnight
    const ms = msUntilNextISTMidnight();
    const timer = setTimeout(() => {
      const newIdx = computeDayIndex(START_DATE_ISO, content.length);
      setTodayIndex(newIdx);
    }, ms + 500); // small buffer

    return () => clearTimeout(timer);
  }, [content]);

  // persist progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // persist meta when it changes
  useEffect(() => {
    writeMeta(meta);
  }, [meta]);

  // helper: count total completed deeds (points) across all days from progress
  function computeTotalPoints(prog) {
    let sum = 0;
    Object.values(prog || {}).forEach(dayObj => {
      if (!dayObj) return;
      sum += Object.values(dayObj).filter(Boolean).length;
    });
    return sum;
  }

  // helper: whether today already has at least one completed deed
  function isTodayCompleted(prog, idx) {
    const day = prog && prog[idx];
    if (!day) return false;
    return Object.values(day).some(Boolean);
  }

  function toggleDeed(dayIdx, deedIdx) {
    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[dayIdx]) copy[dayIdx] = {};
      // flip
      copy[dayIdx][deedIdx] = !copy[dayIdx][deedIdx];

      // After flipping, update meta (streak & total points) only when marking a deed to DONE
      const wasCompletedBefore = Object.values(prev[dayIdx] || {}).some(Boolean);
      const nowCompleted = Object.values(copy[dayIdx] || {}).some(Boolean);

      // totalPoints: compute from copy
      const newTotalPoints = computeTotalPoints(copy);

      // clone previous meta to update
      const newMeta = { ...readMeta(), totalPoints: newTotalPoints };

      const todayDatePart = getISTDatePart(new Date());
      const yesterday = (dateStr) => {
        // returns "YYYY-MM-DD" string for dateStr - 1 day (in IST)
        const base = new Date(dateStr + "T00:00:00+05:30");
        const prev = new Date(base.getTime() - 24 * 3600 * 1000);
        return getISTDatePart(prev);
      };

      // Only take action when the day transitions from not-completed -> completed
      if (!wasCompletedBefore && nowCompleted) {
        // user just completed today for the first time
        const lastDate = newMeta.lastCompletedDate; // could be null
        if (lastDate) {
          // if lastDate was yesterday (consecutive), increment streak; otherwise reset to 1
          if (lastDate === yesterday(todayDatePart)) {
            newMeta.streak = (newMeta.streak || 0) + 1;
          } else if (lastDate === todayDatePart) {
            // already same day (unlikely here), keep streak
          } else {
            newMeta.streak = 1;
          }
        } else {
          newMeta.streak = 1;
        }
        newMeta.lastCompletedDate = todayDatePart;
      } else {
        // If user unchecks (nowCompleted false) we do not decrease streak to keep UX forgiving.
        // Optionally you could handle strict decrement here.
      }

      // Save meta and progress
      setMeta(newMeta);
      return copy;
    });

    setJoyMessage("Lovely — you did a good thing! 🌟");
    setTimeout(() => setJoyMessage(null), 1500);
  }

  if (content.length === 0) {
    return <div className="wrap">Loading…</div>;
  }

  const today = content[todayIndex];

  // compute total done today (for display)
  const totalDoneToday = progress[todayIndex]
    ? Object.values(progress[todayIndex]).filter(Boolean).length
    : 0;

  return (
    <div className="wrap">
      <div className="card">
        {/* Header with brand + meta (Day / Good Points / Streak / Total Points) */}
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
        </header>

        <main className="content">
          <section className="mainText">
            <h2 className="headline">{today.title}</h2>
            <p className="copy">{today.text}</p>
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

        <footer className="footer">
          {joyMessage && (
            <div className="joy" role="status" aria-live="polite">
              {joyMessage}
            </div>
          )}
          <small className="note">Small actions. Big kindness.</small>
        </footer>
      </div>
    </div>
  );
}
