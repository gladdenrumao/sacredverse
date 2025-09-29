/**
 * Footer component displaying joy messages and tagline
 * @param {string} joyMessage - Optional joy message to display
 */
export function Footer({ joyMessage }) {
  return (
    <footer className="footer">
      {joyMessage && (
        <div className="joy" role="status" aria-live="polite">
          {joyMessage}
        </div>
      )}
      <small className="note">Small actions. Big kindness.</small>
    </footer>
  );
}