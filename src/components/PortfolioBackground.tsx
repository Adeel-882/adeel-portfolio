'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GradientWave } from './ui/gradient-wave';
import { DotPattern } from './ui/dot-pattern';
import { WAVE_COLORS } from '@/lib/gradient-wave';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const regions = [
  ['.hero', 0.5],
  ['#positioning', 0.4],
  ['#capabilities', 0.25],
  ['#work', 0.14],
  ['#approach', 0.36],
  ['#background', 0.12],
  ['#toolkit', 0.18],
  ['#about', 0.26],
  ['#contact', 0.46],
] as const;

export function PortfolioBackground() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const shell = root.current!.parentElement!;
      const layer = root.current!.querySelector('.wave-intensity');
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          // One controller / one reusable tween; the shader owns its own internal clock.
          const intensity = gsap.quickTo(layer, 'opacity', { duration: 1.1, ease: 'power2.out' });
          let stops: { top: number; opacity: number }[] = [];
          const measure = () => {
            stops = regions.map(([selector, opacity]) => ({
              top:
                (shell.querySelector(selector) as HTMLElement).getBoundingClientRect().top +
                window.scrollY,
              opacity,
            }));
          };
          const update = () => {
            const readingPosition = window.scrollY + innerHeight * 0.4;
            let value = stops[0]?.opacity ?? 0.5;
            for (const stop of stops.slice(1)) {
              const progress = gsap.utils.clamp(
                0,
                1,
                (readingPosition - stop.top + innerHeight * 0.25) / (innerHeight * 0.5),
              );
              value += (stop.opacity - value) * progress;
              if (progress < 1) break;
            }
            intensity(value);
          };
          measure();
          update();
          ScrollTrigger.create({
            trigger: shell,
            start: 0,
            end: 'max',
            onUpdate: update,
            onRefresh: () => {
              measure();
              update();
            },
          });
        },
        root,
      );
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="portfolio-background" aria-hidden="true">
      <div className="wave-intensity">
        <GradientWave colors={WAVE_COLORS} noiseSpeed={0.000005} darkenTop shadowPower={8} />
      </div>
      <div className="wave-shade" />
      <div className="spectral-atmosphere" />
      <DotPattern />
    </div>
  );
}
