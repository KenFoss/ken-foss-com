import { useEffect, useRef, useState } from 'react';
import type { SiteMode } from '../data/siteContent';
import { BodyReadout } from '../ui/BodyReadout';
import { Dossier } from '../ui/Dossier';
import { StationLog } from '../ui/StationLog';
import { OrbitalMap } from './OrbitalMap';

interface SystemViewProps {
  mode: SiteMode;
  reducedMotion: boolean;
  mobile: boolean;
  timeSpeed: number;
  onExplorePubs: () => void;
  onBackToProfile: () => void;
}

export function SystemView({
  mode,
  reducedMotion,
  mobile,
  timeSpeed,
  onExplorePubs,
  onBackToProfile,
}: SystemViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reserve, setReserve] = useState(mobile ? 250 : 210);
  const dockRef = useRef<HTMLDivElement>(null);

  // Selections belong to one scene, so drop them when the camera moves between scenes.
  useEffect(() => setActiveId(null), [mode]);

  // The orbits are laid out around whatever vertical space the dock leaves free, so the
  // outermost ring never ends up hidden behind the pane. The cap keeps the map usable on
  // short windows even if the pane would rather be taller.
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const measure = () =>
      setReserve(
        Math.min(dock.getBoundingClientRect().height + 12, window.innerHeight * 0.45),
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="system-view">
      <OrbitalMap
        mode={mode}
        reducedMotion={reducedMotion}
        mobile={mobile}
        bottomReserve={reserve}
        timeSpeed={timeSpeed}
        activeId={activeId}
        onActiveChange={setActiveId}
      />

      <div className="system-dock" ref={dockRef}>
        <BodyReadout mode={mode} activeId={activeId} />
        {mode === 'publications' ? (
          <StationLog activeId={activeId} onBackToProfile={onBackToProfile} />
        ) : (
          <Dossier onExplorePubs={onExplorePubs} />
        )}
      </div>
    </div>
  );
}
