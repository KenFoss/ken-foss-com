import { useState } from 'react';
import { BIO_EXPANDED, BIO_SHORT } from '../data/siteContent';

interface DossierProps {
  onExplorePubs: () => void;
}

/** Bottom inspect pane for the home world; carries the bio. */
export function Dossier({ onExplorePubs }: DossierProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={`dossier ${expanded ? 'is-expanded' : ''}`}>
      <header className="dossier-head">
        <span className="dossier-tag">HOME WORLD &#183; SURFACE REPORT</span>
        <span className="dossier-coords">SECTOR KF-01 &#183; 5 SATELLITES</span>
      </header>

      <p className="dossier-bio">
        {BIO_SHORT}
        {expanded ? ` ${BIO_EXPANDED}` : ''}
      </p>

      <div className="dossier-actions">
        <button type="button" className="pixel-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '- COLLAPSE' : '+ EXPAND BIO'}
        </button>
        <button type="button" className="pixel-button is-primary" onClick={onExplorePubs}>
          EXPLORE PUBLICATIONS &gt;
        </button>
      </div>
    </section>
  );
}
