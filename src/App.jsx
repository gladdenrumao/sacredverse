import React, { useEffect, useState } from "react";

/* CONFIG */
const START_DATE_ISO = "2025-09-23"; // Change to your chosen day-1 (YYYY-MM-DD)
const STORAGE_KEY = "sacredverse_v1_progress";

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

  function toggleDeed(dayIdx, deedIdx) {
    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[dayIdx]) copy[dayIdx] = {};
      copy[dayIdx][deedIdx] = !copy[dayIdx][deedIdx];
      return copy;
    });
    setJoyMessage("Lovely — you did a good thing! 🌟");
    setTimeout(() => setJoyMessage(null), 1500);
  }

  if (content.length === 0) {
    return <div className="wrap">Loading…</div>;
  }

  const today = content[todayIndex];

  return (
    <div className="wrap">
      <div className="card">
        <header className="header">
          <div className="logo">SacredVerse</div>
          <div className="meta">Day {todayIndex + 1} / {content.length}</div>
        </header>

        <main>
          <h2 className="title">{today.title}</h2>
          <p className="text">{today.text}</p>

          <div className="deeds">
            {today.deeds.map((d, i) => {
              const checked = progress[todayIndex] && progress[todayIndex][i];
              return (
                <div key={i} className="deed-row">
                  <button
                    className={`deed-btn ${checked ? "checked" : ""}`}
                    onClick={() => toggleDeed(todayIndex, i)}
                    aria-pressed={!!checked}
                  >
                    {checked ? "✓ Done" : "Mark done"}
                  </button>
                  <div className="deed-text">{d}</div>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="footer">
          {joyMessage && <div className="joy">{joyMessage}</div>}
          <small className="note">Small actions. Big kindness.</small>
        </footer>
      </div>
    </div>
  );
}
