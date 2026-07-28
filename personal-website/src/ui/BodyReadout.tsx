import { orbitBodies, publications } from '../data/siteContent';
import type { SiteMode } from '../data/siteContent';

interface BodyReadoutProps {
  mode: SiteMode;
  activeId: string | null;
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Single-line inspect strip for whichever body is under the cursor. */
export function BodyReadout({ mode, activeId }: BodyReadoutProps) {
  const body = orbitBodies.find((candidate) => candidate.id === activeId);
  const station = publications.find((candidate) => candidate.id === activeId);
  const target = body
    ? { name: body.label, detail: body.classification, url: body.url }
    : station
      ? { name: station.code, detail: 'RESEARCH STATION', url: station.url }
      : null;

  if (!target) {
    return (
      <div className="readout is-idle">
        <span className="readout-caret">&gt;</span>
        {mode === 'publications'
          ? 'HOVER A STATION TO INSPECT \u00B7 CLICK TO READ \u00B7 SCROLL TO ZOOM'
          : 'HOVER A SATELLITE TO INSPECT \u00B7 CLICK TO OPEN \u00B7 SCROLL TO ZOOM'}
      </div>
    );
  }

  return (
    <div className="readout">
      <span className="readout-caret">&gt;</span>
      <span className="readout-name">{target.name}</span>
      <span className="readout-sep">&#183;</span>
      <span className="readout-class">{target.detail}</span>
      <span className="readout-sep">&#183;</span>
      <a className="readout-link" href={target.url} target="_blank" rel="noopener noreferrer">
        {hostOf(target.url)} &#x2197;
      </a>
    </div>
  );
}
