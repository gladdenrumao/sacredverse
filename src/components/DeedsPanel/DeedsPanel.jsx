import { DeedButton } from "../Button/Button.jsx";

/**
 * DeedsPanel component displaying the list of daily deeds
 * @param {string[]} deeds - Array of deed texts
 * @param {object} progress - Progress data for the current day
 * @param {number} dayIndex - Current day index
 * @param {function} onToggleDeed - Handler for toggling deed completion
 */
export function DeedsPanel({ deeds, progress, dayIndex, onToggleDeed }) {
  if (!deeds || deeds.length === 0) {
    return null;
  }

  return (
    <aside className="deeds">
      {deeds.map((deed, index) => {
        const checked = progress && progress[index];
        return (
          <div key={index} className="deed-row">
            <DeedButton
              checked={checked}
              onToggle={() => onToggleDeed(dayIndex, index)}
            />
            <div className="deed-text">{deed}</div>
          </div>
        );
      })}
    </aside>
  );
}