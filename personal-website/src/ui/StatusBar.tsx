import type { SiteMode } from '../data/siteContent';
import { requestOrbitalFit } from '../scene/OrbitalMap';

export const SPEED_STEPS = [0, 1, 2.5, 5];
const SPEED_LABELS = ['II', '\u25B8', '\u25B8\u25B8', '\u25B8\u25B8\u25B8'];

interface StatusBarProps {
  mode: SiteMode;
  speedIndex: number;
  onSpeedIndex: (index: number) => void;
}

export function StatusBar({ mode, speedIndex, onSpeedIndex }: StatusBarProps) {
  return (
    <header className="status-bar">
      <span className="status-brand">
        KENFOSS<span className="status-dim">/{mode === 'profile' ? 'ORBITAL MAP' : 'ARCHIVE'}</span>
      </span>

      <div className="status-right">
        <span className="status-dim status-hide-sm">ORBITAL TIME</span>
        <div className="speed-group" role="group" aria-label="Orbital time speed">
          {SPEED_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`speed-button ${speedIndex === index ? 'is-on' : ''}`}
              aria-pressed={speedIndex === index}
              title={index === 0 ? 'Pause orbits' : `Speed ${SPEED_STEPS[index]}x`}
              onClick={() => onSpeedIndex(index)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pixel-button is-small"
          title="Reset zoom to show every orbit"
          onClick={requestOrbitalFit}
        >
          FIT VIEW
        </button>
      </div>
    </header>
  );
}
