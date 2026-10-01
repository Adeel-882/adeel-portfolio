'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const seen = useRef(new WeakSet<Element>());
  const introduced = useRef(false);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      media.add(
        {
          all: '(min-width: 0px)',
          desktop: '(min-width: 801px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduce } = context.conditions!;
          // Reverting this context restores visible, usable server markup.
          if (reduce) return;
          const entrances: { element: Element; timeline: gsap.core.Timeline }[] = [];
          const loops: { element: Element; tween: gsap.core.Tween }[] = [];
          const within = (element: Element, selector: string) => element.querySelectorAll(selector);
          // Remember revealed content across breakpoint changes. Restored scroll positions
          // and deep links never hide content the visitor has already reached.
          const enter = (
            element: Element,
            build: (tl: gsap.core.Timeline) => void,
            start = 'top 88%',
          ) => {
            if (
              seen.current.has(element) ||
              (window.scrollY > 20 && element.getBoundingClientRect().top < innerHeight * 0.85)
            ) {
              seen.current.add(element);
              return;
            }
            const tl = gsap.timeline({
              paused: true,
              defaults: { duration: 0.8, ease: 'power3.out' },
            });
            build(tl);
            entrances.push({ element, timeline: tl });
            ScrollTrigger.create({
              trigger: element,
              animation: tl,
              start,
              end: 'bottom top',
              once: true,
              onEnter: () => {
                seen.current.add(element);
              },
              onLeave: () => {
                tl.progress(1);
              },
            });
          };
          const ambient = (element: Element, target: Element, vars: gsap.TweenVars) => {
            const tween = gsap.to(target, {
              ...vars,
              paused: true,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
            loops.push({ element, tween });
            ScrollTrigger.create({
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => {
                if (self.isActive && !document.hidden) tween.resume();
                else tween.pause();
              },
            });
          };
          const hero = q('.hero')[0];
          let releaseIntro: (() => void) | undefined;
          if (
            !introduced.current &&
            !root.current?.closest('[data-view-changed="true"]') &&
            window.scrollY < 20 &&
            !window.location.hash
          ) {
            const intro = gsap
              .timeline({
                paused: !!document.querySelector('.launch-splash:not([data-phase="released"])'),
                defaults: { ease: 'power3.out' },
              })
              .from(
                q('.site-header > .wordmark, .header-role, .nav, .menu-toggle, .hero-footer'),
                { opacity: 0, duration: 0.3 },
                0.1,
              )
              .from(q('.hero .eyebrow'), { opacity: 0, x: -10, duration: 0.5 }, 0.2)
              .from(q('.hero-line'), { yPercent: 105, duration: 0.85, stagger: 0.1 }, 0.25)
              .from(
                q('.hero-description, .hero-actions'),
                { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 },
                0.45,
              )
              .from(q('.human-enter'), { opacity: 0, x: 40, scale: 1.04, duration: 1.3 }, 0.4);
            entrances.push({ element: hero, timeline: intro });
            releaseIntro = () => {
              intro.play();
            };
            window.addEventListener('portfolio:hero-release', releaseIntro, { once: true });
          }
          introduced.current = true;
          if (desktop) {
            ambient(hero, q('.hero .ambient-light')[0], {
              xPercent: -8,
              yPercent: 5,
              duration: 10,
            });
            gsap.to(q('.hero-main'), {
              yPercent: -6,
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.65 },
            });
            gsap.to(q('.human-scroll'), {
              yPercent: 5,
              scale: 1.025,
              opacity: 0.7,
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.85 },
            });
            // Compact the header visually without animating layout dimensions.
            gsap.to(q('.site-header > .wordmark, .header-role, .nav'), {
              y: -5,
              ease: 'none',
              scrollTrigger: {
                trigger: q('.site-header')[0],
                start: 'top top',
                end: 'bottom top',
                scrub: 0.3,
              },
            });
          }
          enter(
            q('.positioning')[0],
            (tl) => {
              tl.from(
                q('.positioning h2 > span'),
                {
                  x: (i) => (desktop ? [-80, 60, -40] : [-22, 18, -14])[i],
                  duration: 1,
                  stagger: 0.08,
                },
                0,
              )
                .from(q('.positioning-bottom'), { opacity: 0, y: 8, duration: 0.6 }, 0.45)
                .from(q('.positioning .section-label'), { opacity: 0, x: -8, duration: 0.5 }, 0);
            },
            'top 82%',
          );
          enter(q('.capabilities .section-heading')[0], (tl) => {
            tl.from(
              q('#capabilities-title'),
              { clipPath: 'inset(0 100% 0 0)', duration: 0.8 },
              0,
            ).from(q('.capabilities .section-heading > p'), { opacity: 0, duration: 0.6 }, 0.2);
          });
          q('.capability-row').forEach((row: Element) =>
            enter(row, (tl) => {
              tl.from(within(row, '.motion-divider'), { scaleX: 0, duration: 0.95 }, 0)
                .from(within(row, '.capability-number'), { opacity: 0, duration: 0.3 }, 0.02)
                .from(
                  within(row, '.capability-name'),
                  { x: desktop ? -18 : -10, opacity: 0, duration: 0.65 },
                  0.12,
                )
                .from(within(row, '.capability-detail'), { opacity: 0, y: 6, duration: 0.6 }, 0.23)
                .from(within(row, '.round-link'), { opacity: 0, duration: 0.4 }, 0.28);
            }),
          );
          enter(q('.work-heading')[0], (tl) => {
            tl.from(
              q('.work-title-line'),
              { x: (i) => (i ? 1 : -1) * (desktop ? 32 : 16), duration: 0.95, stagger: 0.09 },
              0,
            ).from(q('.work-heading > p'), { opacity: 0, duration: 0.6 }, 0.25);
          });
          q('.project-feature').forEach((project: Element, i: number) => {
            const link = project.querySelector('.project-image-link')!;
            enter(
              link,
              (tl) => {
                tl.from(
                  link,
                  {
                    clipPath: 'inset(0% 0% 100% 0%)',
                    duration: desktop ? 1.2 : 0.9,
                    ease: 'power4.out',
                  },
                  0,
                )
                  .from(within(project, '.project-artwork'), { scale: 1.08, duration: 1.25 }, 0)
                  .from(within(project, '.cover-line'), { yPercent: 108, duration: 0.85 }, 0.25);
                if (i === 0 && desktop) tl.from(link, { scaleX: 0.94, duration: 1.2 }, 0);
              },
              'top 92%',
            );
            if (desktop)
              gsap.fromTo(
                within(project, '.project-visual'),
                { yPercent: -4 },
                {
                  yPercent: 4,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: link,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: i === 0 ? 1 : 0.7,
                  },
                },
              );
          });
          enter(q('.approach-heading')[0], (tl) => {
            tl.from(
              q('.approach .motion-line'),
              { yPercent: 105, stagger: 0.08, duration: 0.85 },
              0,
            ).from(q('.approach-heading > div'), { opacity: 0, duration: 0.65 }, 0.3);
          });
          const process = q('.process')[0];
          enter(process, (tl) => {
            tl.from(
              q('.process-progress'),
              { scaleX: 0, duration: 1.2, ease: 'power2.inOut' },
              0.05,
            )
              .from(
                q('.process-node'),
                { scale: 0.3, opacity: 0, duration: 0.35, stagger: 0.13 },
                0.12,
              )
              .from(
                q('.process-step .micro, .process-title'),
                { opacity: 0, duration: 0.45, stagger: 0.065 },
                0.23,
              )
              .fromTo(
                q('.node-flash'),
                { opacity: 0 },
                { opacity: 0.8, duration: 0.2, stagger: 0.13, repeat: 1, yoyo: true },
                0.25,
              )
              .fromTo(
                q('.process-pulse'),
                { x: 0, opacity: 0 },
                {
                  x: () => process.clientWidth - 36,
                  opacity: 0.7,
                  duration: 1.25,
                  ease: 'power2.inOut',
                },
                0.2,
              )
              .to(q('.process-pulse'), { opacity: 0, duration: 0.3 }, 1.3);
          });
          enter(q('.background-title')[0], (tl) => {
            tl.from(q('.background-title'), { opacity: 0, duration: 0.65 });
          });
          q('.timeline-entry').forEach((row: Element) =>
            enter(row, (tl) => {
              const education = row.closest('.education-column');
              tl.from(within(row, '.motion-divider'), { scaleX: 0, duration: 0.8 }, 0)
                .from(within(row, '.micro'), { opacity: 0, duration: 0.4 }, 0.04)
                .from(within(row, 'h4'), { y: education ? 5 : 8, opacity: 0, duration: 0.6 }, 0.12)
                .from(within(row, 'p'), { opacity: 0, duration: 0.5, stagger: 0.06 }, 0.23);
            }),
          );
          q('.toolkit-row').forEach((row: Element) =>
            enter(row, (tl) => {
              tl.from(within(row, '.motion-divider'), { scaleX: 0, duration: 0.8 }, 0)
                .from(within(row, 'h3'), { y: 6, opacity: 0, duration: 0.55 }, 0.05)
                .from(
                  within(row, '.tool-label'),
                  { opacity: 0, duration: 0.5, stagger: 0.09 },
                  0.18,
                );
            }),
          );
          const about = q('.about')[0];
          enter(q('.about-copy')[0], (tl) => {
            tl.from(q('.about .motion-line'), { yPercent: 105, duration: 1, stagger: 0.1 }, 0).from(
              q('.about-copy h3, .about-copy p, .about-copy > a'),
              { opacity: 0, duration: 0.7, stagger: 0.08 },
              0.35,
            );
          });
          if (desktop) {
            gsap.fromTo(
              q('.about-mark'),
              { y: -22 },
              {
                y: 22,
                ease: 'none',
                scrollTrigger: {
                  trigger: about,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.1,
                },
              },
            );
            ambient(about, q('.about .ambient-light')[0], {
              xPercent: 10,
              yPercent: -6,
              duration: 10,
            });
          }
          const contact = q('.contact')[0];
          enter(q('.contact-grid')[0], (tl) => {
            tl.from(q('.contact .motion-line'), { yPercent: 105, duration: 0.85, stagger: 0.12 }, 0)
              .from(q('.contact-grid p'), { opacity: 0, duration: 0.6 }, 0.35)
              .from(q('.contact-art'), { opacity: 0, duration: 1 }, 0.2)
              .from(
                q('.contact .button, .contact-email'),
                { opacity: 0, y: 8, duration: 0.55, stagger: 0.08 },
                0.65,
              );
          });
          if (desktop)
            ambient(contact, q('.envelope-drift')[0], { rotation: 0.8, y: -6, duration: 7 });
          // Three boundary accents, each plays once. No looping separators.
          q('.boundary-scan').forEach((line: Element) =>
            enter(line, (tl) => {
              tl.fromTo(
                line,
                { scaleX: 0, opacity: 0 },
                { scaleX: 1, opacity: 0.4, duration: 1.1, ease: 'power2.inOut' },
              ).to(line, { opacity: 0, duration: 0.6 });
            }),
          );
          const focus = (event: FocusEvent) => {
            entrances.forEach(({ element, timeline }) => {
              if (element.contains(event.target as Node)) {
                timeline.progress(1);
                seen.current.add(element);
              }
            });
          };
          const visibility = () =>
            loops.forEach(({ element, tween }) => {
              const rect = element.getBoundingClientRect();
              if (!document.hidden && rect.top < innerHeight && rect.bottom > 0) tween.resume();
              else tween.pause();
            });
          root.current?.addEventListener('focusin', focus);
          document.addEventListener('visibilitychange', visibility);
          const container = root.current;
          return () => {
            if (releaseIntro) window.removeEventListener('portfolio:hero-release', releaseIntro);
            container?.removeEventListener('focusin', focus);
            document.removeEventListener('visibilitychange', visibility);
          };
        },
        root,
      );
      media.add(
        '(min-width: 801px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const removals: (() => void)[] = [];
          [['.contact', '.envelope-pointer', 10]].forEach(([area, target, amount]) => {
            const element = q(area as string)[0] as HTMLElement;
            const x = gsap.quickTo(q(target as string), 'x', { duration: 0.9, ease: 'power3.out' });
            const y = gsap.quickTo(q(target as string), 'y', { duration: 0.9, ease: 'power3.out' });
            let rect = element.getBoundingClientRect();
            const measure = () => {
              rect = element.getBoundingClientRect();
            };
            const move = (event: PointerEvent) => {
              if (event.pointerType !== 'mouse') return;
              x(
                gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width - 0.5) * 2) *
                  -(amount as number),
              );
              y(
                gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height - 0.5) * 2) *
                  -(amount as number) *
                  0.7,
              );
            };
            const reset = () => {
              x(0);
              y(0);
            };
            element.addEventListener('pointerenter', measure);
            element.addEventListener('pointermove', move);
            element.addEventListener('pointerleave', reset);
            window.addEventListener('scroll', measure, { passive: true });
            window.addEventListener('resize', measure, { passive: true });
            removals.push(() => {
              element.removeEventListener('pointerenter', measure);
              element.removeEventListener('pointermove', move);
              element.removeEventListener('pointerleave', reset);
              window.removeEventListener('scroll', measure);
              window.removeEventListener('resize', measure);
            });
          });
          return () => removals.forEach((remove) => remove());
        },
        root,
      );
      let mounted = true;
      document.fonts.ready.then(() => {
        if (mounted) ScrollTrigger.refresh();
      });
      return () => {
        mounted = false;
        media.revert();
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className="portfolio-shell">
      {children}
    </div>
  );
}
