'use client';

import { Activity, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplashLaunch } from './SplashLaunch';
import { MachinePortfolio } from './MachinePortfolio';

gsap.registerPlugin(useGSAP, ScrollTrigger);
type View = 'human' | 'machine';

export function PortfolioViews({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<View>('human');
  const [selected, setSelected] = useState<View>('human');
  const [hasSwitched, setHasSwitched] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const switching = useRef(false);
  const switched = useRef(false);
  const { contextSafe } = useGSAP({ scope: root });

  useEffect(() => {
    const toggle = root.current?.querySelector<HTMLElement>('.view-toggle');
    if (!toggle) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = toggle.getBoundingClientRect();
      const obscured =
        mode === 'human' &&
        innerWidth <= 640 &&
        Array.from(
          root.current?.querySelectorAll<HTMLElement>('.human-view .button, .contact-email') ?? [],
        ).some((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.height > 0 &&
            rect.right > bounds.left &&
            rect.left < bounds.right &&
            rect.top < bounds.bottom + 8 &&
            rect.bottom > bounds.top - 8
          );
        });
      // Briefly yield to a mobile CTA underneath; keyboard focus always reveals the control.
      toggle.dataset.obscured = String(obscured);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete toggle.dataset.obscured;
    };
  }, [mode, pathname]);

  const choose = (next: View) =>
    contextSafe(() => {
      if (
        next === mode ||
        switching.current ||
        root.current?.querySelector('.launch-splash[data-blocking="true"]')
      )
        return;
      switching.current = true;
      switched.current = true;
      setHasSwitched(true);
      setSelected(next);
      gsap.to(surface.current, {
        opacity: 0,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.16,
        ease: 'power2.in',
        onComplete: () => setMode(next),
      });
    })();

  useGSAP(
    () => {
      if (!switched.current) return;
      // Reset while faded out: unrelated sections never jump into view mid-transition.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      ScrollTrigger.refresh();
      gsap.fromTo(
        surface.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.26,
          ease: 'power2.out',
          clearProps: 'opacity',
          onComplete: () => {
            switching.current = false;
          },
        },
      );
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      className="portfolio-views"
      data-view={mode}
      data-view-changed={hasSwitched || undefined}
    >
      {/* Keep the approved splash outside the suspended Human subtree. */}
      {pathname === '/' && <SplashLaunch />}
      <div ref={surface} className="view-surface">
        {/* Activity preserves UI state but tears down effects, RAFs, WebGL and ScrollTriggers. */}
        <Activity mode={mode === 'human' ? 'visible' : 'hidden'}>
          <div
            className="human-view"
            inert={mode !== 'human'}
            aria-hidden={mode !== 'human' ? true : undefined}
          >
            {children}
          </div>
        </Activity>
        {mode === 'machine' && <MachinePortfolio pathname={pathname} />}
      </div>
      <div
        className="view-toggle"
        role="group"
        aria-label="Portfolio view"
        data-selected={selected}
      >
        <span className="view-toggle-selection" aria-hidden="true" />
        {(['human', 'machine'] as const).map((view) => (
          <button
            type="button"
            key={view}
            aria-label={`Show ${view} view`}
            aria-pressed={selected === view}
            onClick={() => choose(view)}
          >
            <span className="view-status-dot" aria-hidden="true" />
            {view}
          </button>
        ))}
      </div>
      <span className="view-announcement" role="status" aria-live="polite">
        {mode === 'machine' ? 'Machine view. Structured portfolio content.' : ''}
      </span>
    </div>
  );
}
