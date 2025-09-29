/**
 * Primary button component for user interaction
 * @param {string} children - The text to display
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {string} ariaLabel - Accessibility label
 * @param {object} ...props - Other button props
 */
export function PrimaryButton({ children, onClick, className = "", style, ariaLabel, ...props }) {
  return (
    <button
      className={`primary ${className}`}
      onClick={onClick}
      style={style}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Secondary button component for secondary actions
 * @param {string} children - The text to display
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {string} ariaLabel - Accessibility label
 * @param {object} ...props - Other button props
 */
export function SecondaryButton({ children, onClick, className = "", style, ariaLabel, ...props }) {
  return (
    <button
      className={`secondary ${className}`}
      onClick={onClick}
      style={style}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Theme toggle button component
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {function} onToggle - Theme toggle handler
 */
export function ThemeToggleButton({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={onToggle}
      title="Toggle light/dark"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zm10.45 0l1.8-1.79 1.79 1.79-1.79 1.8-1.8-1.8zM12 5a1 1 0 110-2 1 1 0 010 2zm0 16a1 1 0 110-2 1 1 0 010 2zm7-7a1 1 0 110-2 1 1 0 010 2zM4 12a1 1 0 110-2 1 1 0 010 2zm13.24 6.16l1.8 1.79 1.79-1.79-1.79-1.8-1.8 1.8zM6.76 19.16l-1.79 1.79 1.79 1.8 1.8-1.8-1.8-1.79z"/>
        </svg>
      )}
    </button>
  );
}

/**
 * Deed completion button component
 * @param {boolean} checked - Whether the deed is completed
 * @param {function} onToggle - Toggle handler
 */
export function DeedButton({ checked, onToggle }) {
  return (
    <button
      className={`deed-btn ${checked ? "checked" : ""}`}
      onClick={onToggle}
      aria-pressed={!!checked}
    >
      <span className="dot" aria-hidden></span>
      {checked ? "✓ Done" : "Mark done"}
    </button>
  );
}