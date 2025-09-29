import { SecondaryButton } from "../Button/Button.jsx";

/**
 * MainContent component displaying the daily verse and action buttons
 * @param {object} today - Today's content with title, text, and deeds
 * @param {function} onShare - Share handler
 * @param {function} onCopy - Copy handler
 */
export function MainContent({ today, onShare, onCopy }) {
  if (!today) {
    return null;
  }

  return (
    <section className="mainText">
      <h2 className="headline">{today.title}</h2>
      <p className="copy">{today.text}</p>

      {/* share / actions row */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <SecondaryButton onClick={onShare} ariaLabel="Share today">
          Share
        </SecondaryButton>
        <SecondaryButton onClick={onCopy} ariaLabel="Copy today">
          Copy
        </SecondaryButton>
      </div>
    </section>
  );
}