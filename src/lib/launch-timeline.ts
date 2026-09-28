import { gsap } from 'gsap';
import { launchGeometry } from './launch-geometry';

export function createLaunchTimeline(
  root: HTMLElement,
  releaseHero: () => void,
  complete: () => void,
  reduced = false,
) {
  const svg = root.querySelector<SVGSVGElement>('.launch-scene')!;
  const plane = root.querySelector<SVGImageElement>('.launch-aircraft')!;
  const left = root.querySelector<SVGGElement>('.launch-left')!;
  const right = root.querySelector<SVGGElement>('.launch-right')!;
  const light = root.querySelectorAll('.launch-light');
  const width = root.clientWidth,
    height = root.clientHeight;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const state = { progress: 0 };
  const update = () => {
    const g = launchGeometry(width, height, state.progress);
    root.querySelector('.launch-left-panel')!.setAttribute('d', g.leftPanel);
    root.querySelector('.launch-right-panel')!.setAttribute('d', g.rightPanel);
    root
      .querySelectorAll('.launch-edge-left')
      .forEach((path) => path.setAttribute('d', g.leftEdge));
    root
      .querySelectorAll('.launch-edge-right')
      .forEach((path) => path.setAttribute('d', g.rightEdge));
    root
      .querySelectorAll('.launch-strand')
      .forEach((path, i) => path.setAttribute('d', g.strands[i]));
    plane.setAttribute('width', String(g.planeWidth));
    plane.setAttribute('height', String((g.planeWidth * 158) / 120));
    plane.setAttribute(
      'transform',
      `translate(${g.x - (g.planeWidth * g.scale) / 2} ${g.y}) scale(${g.scale})`,
    );
    root.dataset.progress = state.progress.toFixed(3);
  };
  update();
  const timeline = gsap.timeline({
    paused: true,
    onComplete: complete,
    defaults: { ease: 'power2.out' },
  });
  if (reduced) {
    timeline.call(releaseHero, [], 0).to(root, { opacity: 0, duration: 0.28 }, 0.02);
    return timeline;
  }
  timeline
    .addLabel('launch', 0.08)
    .set(plane, { opacity: 1 }, 'launch')
    .to(light, { opacity: 1, duration: 0.18 }, 'launch')
    .to(state, { progress: 1, duration: 1.65, ease: 'power1.in', onUpdate: update }, 'launch')
    .call(releaseHero, [], 1.22)
    .addLabel('release', 1.69)
    .to(left, { x: -width * 0.64, duration: 0.41, ease: 'power3.in' }, 'release')
    .to(right, { x: width * 0.64, duration: 0.41, ease: 'power3.in' }, 'release')
    .to(light, { opacity: 0, duration: 0.23 }, 1.89);
  return timeline;
}
