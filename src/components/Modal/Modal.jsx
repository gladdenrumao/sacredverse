import { PrimaryButton, SecondaryButton } from "../Button/Button.jsx";

/**
 * Badge achievement modal component
 * @param {number} badgeNumber - Number of days for the badge (e.g., 3, 7, 30)
 * @param {function} onClose - Close modal handler
 * @param {function} onShare - Share achievement handler
 */
export function BadgeModal({ badgeNumber, onClose, onShare }) {
  if (!badgeNumber) return null;

  return (
    <div className="badge-overlay" role="dialog" aria-modal="true">
      <div className="badge-card">
        <div className="badge-emoji">🏅</div>
        <h3>Nice — {badgeNumber}-day streak!</h3>
        <p>You've completed good deeds {badgeNumber} days in a row. Keep going — small steps build habit.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <PrimaryButton onClick={onClose}>
            Sweet!
          </PrimaryButton>
          <SecondaryButton onClick={onShare}>
            Share
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Badges collection modal component
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Close modal handler
 * @param {object} meta - Meta data containing badges array
 * @param {number[]} badgeThresholds - Array of badge threshold values
 */
export function BadgesModal({ show, onClose, meta, badgeThresholds }) {
  if (!show) return null;

  const handleBadgeShare = (threshold) => {
    const shareText = `I earned a ${threshold}-day kindness streak on SacredVerse 🌱 — small daily deeds, big heart.`;
    if (navigator.share) {
      navigator.share({ 
        title: "SacredVerse", 
        text: shareText, 
        url: window.location.href 
      }).catch(() => {});
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + window.location.href)}`;
      window.open(wa, "_blank");
    }
  };

  return (
    <div className="badge-overlay" role="dialog" aria-modal="true">
      <div className="badge-card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Your Badges</h3>
          <SecondaryButton onClick={onClose} ariaLabel="Close badges">
            Close
          </SecondaryButton>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {badgeThresholds.map((threshold) => {
            const unlocked = (meta.badges || []).includes(threshold);
            return (
              <div 
                key={threshold} 
                className={`badge-tile ${unlocked ? "unlocked" : "locked"}`} 
                style={{ 
                  padding: 12, 
                  borderRadius: 12, 
                  textAlign: "center", 
                  background: unlocked ? "linear-gradient(90deg,var(--green-300),var(--green-400))" : "transparent", 
                  color: unlocked ? "white" : "var(--muted)", 
                  border: unlocked ? "0" : "1px solid rgba(15,23,36,0.06)" 
                }}
              >
                <div style={{ fontSize: 28 }}>{unlocked ? "🏅" : "🔒"}</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>{threshold}-day streak</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  {unlocked ? "Unlocked — nice!" : `Complete ${threshold} days in a row`}
                </div>
                {unlocked && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
                    <SecondaryButton onClick={() => handleBadgeShare(threshold)}>
                      Share
                    </SecondaryButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <small style={{ color: "var(--muted)" }}>
            Badges are stored on this device. Sign-in coming soon to sync across devices.
          </small>
        </div>
      </div>
    </div>
  );
}

/**
 * Onboarding modal component for first-time users
 * @param {boolean} show - Whether to show the modal
 * @param {function} onStart - Start journey handler
 */
export function OnboardingModal({ show, onStart }) {
  if (!show) return null;

  return (
    <div className="onboard-overlay" role="dialog" aria-modal="true">
      <div className="onboard-card">
        <div className="logo-round" style={{ margin: "0 auto 12px auto" }}>SV</div>
        <h2>Welcome to SacredVerse</h2>
        <p>
          One simple verse + one good deed every day.  
          Small steps of kindness that grow into lasting change.
        </p>
        <PrimaryButton onClick={onStart}>
          Start my journey 🌱
        </PrimaryButton>
      </div>
    </div>
  );
}