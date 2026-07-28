import { MEDIUM_PROFILE_URL, publications } from '../data/siteContent';

interface StationLogProps {
  activeId: string | null;
  onBackToProfile: () => void;
}

/** Inspect pane for close orbit: names the selected station and links out to the article. */
export function StationLog({ activeId, onBackToProfile }: StationLogProps) {
  const active = publications.find((pub) => pub.id === activeId) ?? null;

  return (
    <section className="dossier station-log">
      <header className="dossier-head">
        <span className="dossier-tag">LOW ORBIT &#183; STATION LOG</span>
        <span className="dossier-coords">
          {publications.length} STATIONS &#183; MEDIUM RELAY
        </span>
      </header>

      <p className="dossier-bio">
        {active ? (
          <>
            <span className="station-code">{active.code}</span>
            <span className="station-title">{active.title}</span>
          </>
        ) : (
          `Each station in close orbit holds one published article. Hover a station for its designation, then open it to read on Medium.`
        )}
      </p>

      <div className="dossier-actions">
        <a
          className="pixel-button is-primary"
          href={active ? active.url : MEDIUM_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {active ? 'READ ARTICLE >' : 'OPEN MEDIUM >'}
        </a>
        <button type="button" className="pixel-button" onClick={onBackToProfile}>
          &lt; BACK TO PROFILE
        </button>
      </div>
    </section>
  );
}
