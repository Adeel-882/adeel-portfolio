'use client';
import { useEffect, useRef } from 'react';
import { Gradient, type WaveOptions } from '@/lib/gradient-wave';

export interface GradientWaveProps extends WaveOptions {
  isPlaying?: boolean;
  className?: string;
}

export function GradientWave({ isPlaying = true, className = '', ...options }: GradientWaveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const control = useRef<((options: WaveOptions, play: boolean) => void) | null>(null);
  useEffect(() => {
    const container = containerRef.current!;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer: Gradient | null = null;
    let settings: WaveOptions = {};
    let requested = true;
    let inView = true;
    let sized = false;
    let disposed = false;
    const fallback = () => {
      renderer?.dispose();
      renderer = null;
      container.dataset.renderer = 'fallback';
      container.dataset.motion = 'static';
    };
    const syncPlayback = () => {
      if (!renderer) return;
      const visible = !document.hidden && inView && sized;
      const moving = requested && !reduce.matches && visible;
      if (moving) renderer.start();
      else renderer.stop();
      if (visible && !moving) renderer.render();
      container.dataset.motion = moving ? 'playing' : visible ? 'static' : 'paused';
    };
    const resize = () => {
      if (!renderer) return;
      sized = container.clientWidth > 0 && container.clientHeight > 0;
      try {
        renderer.resize(container.clientWidth, container.clientHeight, devicePixelRatio || 1);
        container.dataset.quality = container.clientWidth <= 800 ? 'mobile' : 'desktop';
        syncPlayback();
      } catch {
        fallback();
      }
    };
    const initialize = () => {
      if (disposed) return;
      try {
        renderer = new Gradient(canvas);
        renderer.configure(settings);
        resize();
        if (renderer) container.dataset.renderer = 'webgl';
      } catch {
        fallback();
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      fallback();
    };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', initialize);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      syncPlayback();
    });
    intersection.observe(container);
    reduce.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    control.current = (next, play) => {
      settings = next;
      requested = play;
      try {
        renderer?.configure(settings);
        renderer?.render();
        syncPlayback();
      } catch {
        fallback();
      }
    };
    initialize();
    return () => {
      disposed = true;
      control.current = null;
      observer.disconnect();
      intersection.disconnect();
      reduce.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', initialize);
      renderer?.dispose(true);
      canvas.remove();
    };
  }, []);

  const { colors, shadowPower, darkenTop, noiseSpeed, noiseFrequency, deform } = options;
  useEffect(() => {
    control.current?.(
      { colors, shadowPower, darkenTop, noiseSpeed, noiseFrequency, deform },
      isPlaying,
    );
  }, [colors, shadowPower, darkenTop, noiseSpeed, noiseFrequency, deform, isPlaying]);

  return (
    <div
      ref={containerRef}
      className={`gradient-wave ${className}`}
      aria-hidden="true"
      data-renderer="fallback"
    />
  );
}
