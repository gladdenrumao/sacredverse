import { SecondaryButton, ThemeToggleButton } from "../Button/Button.jsx";

/**
 * Header component containing brand, stats, badges button, and theme toggle
 * @param {number} todayIndex - Current day index
 * @param {number} contentLength - Total number of content entries
 * @param {number} totalDoneToday - Number of deeds completed today
 * @param {object} meta - Meta data containing streak and total points
 * @param {string} theme - Current theme
 * @param {function} onThemeToggle - Theme toggle handler
 * @param {function} onShowBadges - Show badges handler
 */
export function Header({
  todayIndex,
  contentLength,
  totalDoneToday,
  meta,
  theme,
  onThemeToggle,
  onShowBadges
}) {
  return (
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
          Day <strong style={{ color: "var(--text)", fontWeight: 700 }}>{todayIndex + 1}</strong> / {contentLength}
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
      <SecondaryButton
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        onClick={onShowBadges}
        ariaLabel="Show badges"
      >
        🏅 Badges
      </SecondaryButton>
      
      {/* Theme toggle */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <ThemeToggleButton theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
}