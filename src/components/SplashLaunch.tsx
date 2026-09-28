'use client';
import { useId, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { createLaunchTimeline } from '@/lib/launch-timeline';

gsap.registerPlugin(useGSAP);
// Survives client-side page navigation; a full document load resets it.
let launchPlayed = false;

export function SplashLaunch() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const id = useId().replace(/:/g, '');
  useGSAP(
    () => {
      const element = root.current!;
      let disposed = false,
        finished = false,
        released = false;
      let detach = () => {};
      let restoreScroll = () => {};
      element.hidden = false;
      element.style.width = `${innerWidth}px`;
      const release = () => {
        if (released || disposed) return;
        released = true;
        element.dataset.phase = 'released';
        window.dispatchEvent(new Event('portfolio:hero-release'));
      };
      const finish = () => {
        if (finished || disposed) return;
        finished = true;
        launchPlayed = true;
        release();
        element.dataset.blocking = 'false';
        element.hidden = true;
        restoreScroll();
        detach();
        setActive(false);
      };
      if (launchPlayed) {
        finish();
        return;
      }
      const html = document.documentElement;
      const body = document.body;
      const previousOverflow = html.style.overflow;
      const previousPadding = body.style.paddingRight;
      const gutter = innerWidth - html.clientWidth;
      const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
      html.style.overflow = 'hidden';
      if (gutter > 0) body.style.paddingRight = `${padding + gutter}px`;
      restoreScroll = () => {
        html.style.overflow = previousOverflow;
        body.style.paddingRight = previousPadding;
      };
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const timeline = createLaunchTimeline(element, release, finish, reduced.matches);
      const width = innerWidth,
        height = innerHeight;
      const skip = () => {
        timeline.kill();
        finish();
      };
      const resize = () => {
        if (innerWidth !== width || innerHeight !== height) skip();
      };
      const key = (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Tab') skip();
      };
      window.addEventListener('keydown', key);
      window.addEventListener('resize', resize);
      window.addEventListener('pagehide', skip);
      reduced.addEventListener('change', skip);
      // Decode critical images and fonts concurrently, with a short bounded wait.
      const images = ['/splash/supersonic-aircraft.svg', '/hero-three/hero-spectral.webp'].map(
        (src) => {
          const image = new Image();
          image.src = src;
          return image.decode().catch(() => {});
        },
      );
      const start = () => {
        if (!disposed && !finished && timeline.paused()) {
          element.dataset.phase = 'flight';
          timeline.play();
        }
      };
      const preloadTimeout = window.setTimeout(start, reduced.matches ? 0 : 220);
      Promise.allSettled([document.fonts.ready, ...images]).then(start);
      // A suspended/failed animation must never strand an opaque overlay.
      const watchdog = window.setTimeout(skip, 3000);
      detach = () => {
        clearTimeout(preloadTimeout);
        clearTimeout(watchdog);
        window.removeEventListener('keydown', key);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pagehide', skip);
        reduced.removeEventListener('change', skip);
      };
      return () => {
        disposed = true;
        timeline.kill();
        detach();
        restoreScroll();
      };
    },
    { scope: root },
  );
  if (!active) return null;
  return (
    <div
      className="launch-splash"
      ref={root}
      data-phase="waiting"
      data-blocking="true"
      aria-hidden="true"
    >
      <svg
        className="launch-scene"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <filter id={`${id}-soft`} x="-40%" y="-20%" width="180%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${id}-halo`} x="-50%" y="-25%" width="200%" height="150%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3F0E8" stopOpacity=".95" />
            <stop offset=".4" stopColor="#F6C77A" stopOpacity=".65" />
            <stop offset="1" stopColor="#5D48B7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="launch-left">
          <path className="launch-left-panel" fill="#1241C7" d="M0 0H501V1000H0Z" />
          <g className="launch-light" fill="none">
            <path
              className="launch-edge-left"
              stroke="#5D48B7"
              strokeWidth="60"
              opacity=".7"
              filter={`url(#${id}-halo)`}
            />
            <path
              className="launch-edge-left"
              stroke="#FF6935"
              strokeWidth="30"
              opacity=".85"
              filter={`url(#${id}-soft)`}
            />
            <path
              className="launch-edge-left"
              stroke="#F6C77A"
              strokeWidth="12"
              filter={`url(#${id}-soft)`}
            />
            <path className="launch-edge-left" stroke="#F3F0E8" strokeWidth="3" opacity=".8" />
          </g>
        </g>
        <g className="launch-right">
          <path className="launch-right-panel" fill="#1241C7" d="M499 0H1000V1000H499Z" />
          <g className="launch-light" fill="none">
            <path
              className="launch-edge-right"
              stroke="#5D48B7"
              strokeWidth="70"
              opacity=".8"
              filter={`url(#${id}-halo)`}
            />
            <path
              className="launch-edge-right"
              stroke="#F6C77A"
              strokeWidth="28"
              opacity=".7"
              filter={`url(#${id}-soft)`}
            />
            <path
              className="launch-edge-right"
              stroke="#F3F0E8"
              strokeWidth="11"
              opacity=".9"
              filter={`url(#${id}-soft)`}
            />
            <path className="launch-edge-right" stroke="#F3F0E8" strokeWidth="2" opacity=".6" />
          </g>
        </g>
        <g className="launch-light launch-core" fill="none" stroke={`url(#${id}-trail)`}>
          <path className="launch-strand" strokeWidth="7" filter={`url(#${id}-soft)`} />
          <path className="launch-strand" strokeWidth="2" opacity=".7" />
          <path className="launch-strand" strokeWidth="1.5" opacity=".45" />
        </g>
        <image
          className="launch-aircraft"
          href="/splash/supersonic-aircraft.svg"
          width="120"
          height="158"
        />
      </svg>
      <noscript>
        <style>
          {
            '.launch-splash{display:none!important}html:has(.launch-splash){overflow:auto!important}'
          }
        </style>
      </noscript>
    </div>
  );
}
