import React, { useEffect, useState } from "react";
import { Header, MainContent, DeedsPanel, Footer, BadgeModal, BadgesModal, OnboardingModal } from "./components/index.js";

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

/* onboarding key */
const ONBOARD_KEY = "sacredverse_onboarded";

/* theme key */
const THEME_KEY = "sacredverse_theme";

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

  /* onboarding modal state */
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARD_KEY);
    } catch {
      return true;
    }
  });

  /* theme state */
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || null;
    } catch {
      return null;
    }
  });

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

  /* onboarding localStorage effect */
  useEffect(() => {
    if (!showOnboarding) {
      localStorage.setItem(ONBOARD_KEY, "true");
    }
  }, [showOnboarding]);

  /* apply theme to html element */
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
  function _isTodayCompleted(prog, idx) {
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

  function _resetAllLocalData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    location.reload();
  }

  if (content.length === 0) {
    return <div className="wrap">Loading…</div>;
  }

  const today = content[todayIndex];
  const totalDoneToday = progress[todayIndex] ? Object.values(progress[todayIndex]).filter(Boolean).length : 0;

  const handleShareBadge = () => {
    setBadgeModal(null);
    const shareText = `I just earned a ${badgeModal}-day kindness streak on SacredVerse 🌱 — small daily deeds, big heart.`;
    if (navigator.share) {
      navigator.share({ title: "SacredVerse", text: shareText, url: window.location.href }).catch(() => {});
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + window.location.href)}`;
      window.open(wa, "_blank");
    }
  };

  return (
    <div className="wrap">
      <div className="card">
        <Header
          todayIndex={todayIndex}
          contentLength={content.length}
          totalDoneToday={totalDoneToday}
          meta={meta}
          theme={theme}
          onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onShowBadges={() => setShowBadges(true)}
        />

        <main className="content">
          <MainContent
            today={today}
            onShare={shareToday}
            onCopy={copyTodayText}
          />

          <DeedsPanel
            deeds={today.deeds}
            progress={progress[todayIndex]}
            dayIndex={todayIndex}
            onToggleDeed={toggleDeed}
          />
        </main>

        <Footer joyMessage={joyMessage} />
      </div>

      <BadgeModal
        badgeNumber={badgeModal}
        onClose={() => setBadgeModal(null)}
        onShare={handleShareBadge}
      />

      <BadgesModal
        show={showBadges}
        onClose={() => setShowBadges(false)}
        meta={meta}
        badgeThresholds={BADGE_THRESHOLDS}
      />

      <OnboardingModal
        show={showOnboarding}
        onStart={() => setShowOnboarding(false)}
      />

      {/* dev helper: reset (hidden behind keyboard shortcut or remove in production) */}
      {/* For safety, we won't render a visible reset control. Use console: window.appResetMeta() */}
    </div>
  );
}