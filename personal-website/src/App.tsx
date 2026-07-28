import { useCallback, useEffect, useState } from 'react';
import type { SiteMode } from './data/siteContent';
import { useIsMobile, usePrefersReducedMotion } from './hooks/useViewport';
import { SystemView } from './scene/SystemView';
import { SPEED_STEPS, StatusBar } from './ui/StatusBar';

function modeFromPath(): SiteMode {
  return window.location.pathname.includes('publications') ? 'publications' : 'profile';
}

export default function App() {
  const [mode, setMode] = useState<SiteMode>(modeFromPath);
  const reducedMotion = usePrefersReducedMotion();
  const mobile = useIsMobile();
  // Orbits start paused when the visitor asked for reduced motion, but the speed
  // controls stay available so they can opt back in.
  const [speedIndex, setSpeedIndex] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : 1,
  );

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const setModeAndUrl = useCallback((next: SiteMode) => {
    setMode(next);
    window.history.pushState({ mode: next }, '', next === 'publications' ? '/publications' : '/');
  }, []);

  useEffect(() => {
    const onPop = () => setMode(modeFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="app-shell">
      <SystemView
        mode={mode}
        reducedMotion={reducedMotion}
        mobile={mobile}
        timeSpeed={SPEED_STEPS[speedIndex] ?? 1}
        onExplorePubs={() => setModeAndUrl('publications')}
        onBackToProfile={() => setModeAndUrl('profile')}
      />

      <StatusBar mode={mode} speedIndex={speedIndex} onSpeedIndex={setSpeedIndex} />
    </div>
  );
}
