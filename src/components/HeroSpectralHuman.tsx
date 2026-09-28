'use client';

import { useEffect, useRef } from 'react';

export function HeroSpectralHuman() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    // The transparent image appears immediately; Three.js loads only on the client.
    import('@/lib/spectral-human')
      .then(({ mountSpectralHuman }) => {
        if (!cancelled && root.current)
          dispose = mountSpectralHuman(root.current, root.current.closest('.hero')!);
      })
      .catch(() => {
        /* The static source remains visible if the module cannot load. */
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);
  return (
    <div className="spectral-human" ref={root} aria-hidden="true">
      {/* Native source is also the WebGL/reduced-motion fallback. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-three/hero-spectral.webp"
        className="spectral-fallback"
        alt=""
        width={960}
        height={1200}
        fetchPriority="high"
        draggable={false}
      />
    </div>
  );
}
