'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { createDotFlow, stepDotFlow, type FlowDot } from '@/lib/dot-flow';
import { colors } from '@/lib/colors';

interface DotPatternProps {
  color?: string;
  className?: string;
}

export function DotPattern({
  color = 'color-mix(in srgb, var(--color-primary) 45%, transparent)',
  className = '',
}: DotPatternProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current!;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    container.dataset.effect = 'flow-field';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, influence: 0 };
    let dots: FlowDot[] = [];
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      lastMove = 0;
    let active = false,
      inView = true,
      disposed = false;
    let bounds = container.getBoundingClientRect();
    const palette = [colors.primary, colors['text-secondary'], colors.flare, colors.solar];
    const enabled = () =>
      !disposed &&
      !reduce.matches &&
      fine.matches &&
      !document.hidden &&
      inView &&
      width > 0 &&
      height > 0;
    const paint = () => {
      context.clearRect(0, 0, width, height);
      context.lineCap = 'round';
      for (const dot of dots) {
        const edge = Math.max(
          0,
          Math.min(1, dot.x / 28, dot.y / 28, (width - dot.x) / 28, (height - dot.y) / 28),
        );
        const near =
          Math.max(0, 1 - Math.hypot(dot.x - pointer.x, dot.y - pointer.y) / 250) *
          pointer.influence;
        context.globalAlpha =
          (0.28 + dot.depth * 0.25 + near * 0.25) * edge * (dot.shade >= 2 ? 0.65 : 1);
        context.strokeStyle = palette[dot.shade];
        context.lineWidth = dot.size;
        const speed = Math.hypot(dot.vx, dot.vy);
        const angle = speed > 1 ? Math.atan2(dot.vy, dot.vx) : dot.phase;
        const length = 1.1 + Math.min(2, speed * 0.012);
        context.beginPath();
        context.moveTo(dot.x, dot.y);
        context.lineTo(dot.x + Math.cos(angle) * length, dot.y + Math.sin(angle) * length);
        context.stroke();
      }
      context.globalAlpha = 1;
    };
    const draw = (time: number) => {
      frame = 0;
      if (!enabled()) return;
      const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 1 / 60;
      previous = time;
      const attention = active ? 0.25 + 0.75 * Math.exp(-(time - lastMove) / 700) : 0;
      pointer.influence += (attention - pointer.influence) * (1 - Math.exp(-8 * dt));
      stepDotFlow(dots, dt, time / 1000, width, height, pointer);
      pointer.vx *= Math.exp(-6 * dt);
      pointer.vy *= Math.exp(-6 * dt);
      paint();
      frame = requestAnimationFrame(draw);
    };
    const reset = () => {
      active = false;
      pointer.vx = pointer.vy = 0;
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (disposed) return;
      reset();
      pointer.influence = 0;
      container.dataset.interactive = String(enabled());
      if (enabled()) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      if (disposed) return;
      width = container.clientWidth;
      height = container.clientHeight;
      bounds = container.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = createDotFlow(width, height);
      container.dataset.dots = String(dots.length);
      paint();
      sync();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !enabled()) return;
      const x = event.clientX - bounds.left,
        y = event.clientY - bounds.top;
      const now = performance.now();
      const dt = Math.max(16, now - lastMove) / 1000;
      pointer.vx = active ? Math.max(-900, Math.min(900, (x - pointer.x) / dt)) : 0;
      pointer.vy = active ? Math.max(-900, Math.min(900, (y - pointer.y) / dt)) : 0;
      pointer.x = x;
      pointer.y = y;
      active = true;
      lastMove = now;
    };
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) reset();
    };
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(container);
    intersection.observe(container);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    fine.addEventListener('change', sync);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener('change', sync);
      fine.removeEventListener('change', sync);
      canvas.remove();
      delete container.dataset.effect;
      delete container.dataset.interactive;
      delete container.dataset.dots;
    };
  }, []);
  return (
    <div
      ref={root}
      className={`dot-pattern ${className}`}
      style={{ '--dot-color': color } as CSSProperties}
      aria-hidden="true"
    />
  );
}
