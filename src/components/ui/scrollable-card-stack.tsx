'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface CardItem {
  id: string;
  label: string;
  name: string;
  content: ReactNode;
}

// Adapted from the supplied 21st.dev stack: scaled frames, spring transitions,
// one-card navigation and reduced motion. A native sticky track follows page scroll.
export default function ScrollableCardStack({
  items,
  className = '',
}: {
  items: CardItem[];
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const reduce = useReducedMotion();
  const activate = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(items.length - 1, index));
      if (next === current.current) return;
      current.current = next;
      setCurrentIndex(next);
    },
    [items.length],
  );

  const select = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(items.length - 1, index));
      const element = track.current;
      const inner = stack.current;
      if (
        !element ||
        !inner ||
        matchMedia('(prefers-reduced-motion: reduce), (max-height: 600px)').matches
      ) {
        activate(next);
        return;
      }
      const top = parseFloat(getComputedStyle(inner).top);
      const distance = element.offsetHeight - inner.offsetHeight;
      window.scrollTo({
        top:
          window.scrollY +
          element.getBoundingClientRect().top -
          top +
          distance * ((next + 0.15) / items.length),
        behavior: 'smooth',
      });
    },
    [activate, items.length],
  );

  useEffect(() => {
    const element = track.current;
    const inner = stack.current;
    if (!element || !inner) return;
    const manual = matchMedia('(prefers-reduced-motion: reduce), (max-height: 600px)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (manual.matches) return;
      const top = parseFloat(getComputedStyle(inner).top);
      const distance = element.offsetHeight - inner.offsetHeight;
      const progress = (top - element.getBoundingClientRect().top) / Math.max(distance, 1);
      activate(Math.floor(Math.max(0, Math.min(1, progress)) * items.length));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    observer.observe(inner);
    window.addEventListener('scroll', schedule, { passive: true });
    manual.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      manual.removeEventListener('change', schedule);
    };
  }, [items.length, activate]);

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Record<string, number> = {
      ArrowLeft: -1,
      ArrowUp: -1,
      ArrowRight: 1,
      ArrowDown: 1,
    };
    if (event.key in directions) {
      event.preventDefault();
      select(current.current + directions[event.key]);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : items.length - 1);
    }
  };
  if (!items.length) return null;
  return (
    <div className="work-stack-track" ref={track}>
      <div className={`work-stack ${className}`} ref={stack} onKeyDown={keyboard}>
        <div
          className="stack-stage"
          ref={region}
          role="region"
          aria-roledescription="carousel"
          aria-label="Selected project cards"
          tabIndex={0}
          onPointerDown={(event) => {
            suppressClick.current = false;
            if (event.pointerType === 'mouse' || !event.isPrimary) return;
            touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            const origin = touch.current;
            if (!origin || origin.id !== event.pointerId) return;
            const dx = event.clientX - origin.x,
              dy = event.clientY - origin.y;
            if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
              touch.current = null;
              return;
            }
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              suppressClick.current = true;
              touch.current = null;
              select(current.current + (dx < 0 ? 1 : -1));
            }
          }}
          onPointerUp={() => {
            touch.current = null;
          }}
          onPointerCancel={() => {
            touch.current = null;
          }}
          onClickCapture={(event) => {
            if (suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }
          }}
        >
          {items.map((item, index) => {
            const offset = index - currentIndex;
            const active = index === currentIndex;
            return (
              <motion.article
                key={item.id}
                className="stack-card"
                data-active={active}
                aria-hidden={!active}
                inert={!active}
                aria-label={`${index + 1} of ${items.length}: ${item.name}`}
                initial={false}
                animate={{
                  scale: reduce ? 1 : 1 - Math.max(0, offset) * 0.055,
                  y: reduce ? 0 : offset < 0 ? 180 : -Math.min(offset, 3) * 18,
                  opacity: offset < 0 || (reduce && !active) ? 0 : 1,
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 150, damping: 26, mass: 0.9 }
                }
                style={{ zIndex: items.length - index, pointerEvents: active ? 'auto' : 'none' }}
              >
                {item.content}
              </motion.article>
            );
          })}
        </div>
        <div className="stack-navigation">
          <div className="stack-choices" role="group" aria-label="Choose a project card">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={index === currentIndex}
                onClick={() => select(index)}
              >
                <span className="micro">0{index + 1}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="stack-arrows">
            <button
              type="button"
              aria-label="Previous card"
              disabled={currentIndex === 0}
              onClick={() => select(currentIndex - 1)}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next card"
              disabled={currentIndex === items.length - 1}
              onClick={() => select(currentIndex + 1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="stack-status">
          <span className="micro" role="status" aria-live="polite">
            0{currentIndex + 1} / 0{items.length} — {items[currentIndex].label}
          </span>
          <span className="micro">SCROLL / SWIPE / SELECT TO EXPLORE</span>
        </div>
      </div>
    </div>
  );
}
