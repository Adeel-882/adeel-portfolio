import * as THREE from 'three';
import { gsap } from 'gsap';
import { PORTRAIT_CAMERA_Z, dampPointer, normalizePointer, curvePointer } from './spectral-relief';
import {
  createRelief,
  createPortraitRig,
  portraitVertexShader,
  portraitFragmentShader,
  type PortraitAlpha,
} from './spectral-layers';

export function mountSpectralHuman(container: HTMLElement, hero: HTMLElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const compact = matchMedia('(max-width: 800px)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  let renderer: THREE.WebGLRenderer | null = null;
  let geometry: THREE.PlaneGeometry | null = null;
  const materials: THREE.ShaderMaterial[] = [];
  let texture: THREE.Texture | null = null;
  const meshes: THREE.Mesh[] = [];
  let alpha: PortraitAlpha | undefined;
  let disposed = false;
  let lost = false;
  let ready = false;
  let inView = true;
  let ticking = false;
  let elapsed = 0;
  let targetX = 0;
  let targetY = 0;
  let active = 0;
  let engagement = 0;
  let touchInput = false;
  let gesture: {
    id: number;
    x: number;
    y: number;
    intent: 'pending' | 'horizontal' | 'scroll';
  } | null = null;
  let lastCompact = compact.matches;
  const scene = new THREE.Scene();
  const rig = createPortraitRig();
  scene.add(rig.root);
  const camera = new THREE.PerspectiveCamera(32, 0.8, 0.1, 20);
  camera.position.z = PORTRAIT_CAMERA_Z;
  const uniforms = {
    portrait: { value: null as THREE.Texture | null },
    pointer: { value: new THREE.Vector2() },
    rimPointer: { value: new THREE.Vector2() },
    breath: { value: 1 },
    energy: { value: 1 },
    rearMatrix: { value: rig.layers[0].matrix },
    headMatrix: { value: rig.layers[1].matrix },
    faceMatrix: { value: rig.layers[2].matrix },
  };
  const stop = () => {
    gsap.ticker.remove(tick);
    ticking = false;
  };
  const draw = () => {
    if (!renderer || !ready || lost || disposed) return;
    renderer.render(scene, camera);
  };
  const neutral = () => {
    targetX = targetY = active = engagement = 0;
    rig.layers.forEach((layer) => {
      layer.x = layer.y = 0;
      layer.group.rotation.set(0, 0, 0);
      layer.group.position.copy(layer.basePosition);
    });
    rig.root.position.y = 0;
    rig.updateMatrices();
    uniforms.pointer.value.set(0, 0);
    uniforms.rimPointer.value.set(0, 0);
    uniforms.breath.value = 1;
    uniforms.energy.value = 1;
  };
  function tick(_time: number, deltaMs: number) {
    if (
      !meshes.length ||
      !ready ||
      disposed ||
      lost ||
      document.hidden ||
      !inView ||
      reduce.matches
    )
      return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    elapsed += dt;
    engagement = dampPointer(engagement, active, dt, 8);
    const range = compact.matches || touchInput ? 0.8 : 1;
    const idle = (1 - engagement) * (coarse.matches ? 0.7 : 1);
    rig.layers.forEach((layer) => {
      layer.x = dampPointer(layer.x, targetX * engagement, dt, layer.damping);
      layer.y = dampPointer(layer.y, targetY * engagement, dt, layer.damping);
      layer.group.rotation.y =
        layer.x * THREE.MathUtils.degToRad(layer.yaw) * range +
        Math.sin(elapsed * 0.63) * 0.006 * layer.idle * idle;
      layer.group.rotation.x =
        layer.y * THREE.MathUtils.degToRad(layer.pitch) * range +
        Math.cos(elapsed * 0.52) * 0.0013 * layer.idle * idle;
      layer.group.position.copy(layer.basePosition);
      layer.group.position.x += layer.x * layer.shiftX * range;
      layer.group.position.y -= layer.y * layer.shiftY * range;
    });
    rig.root.position.y = Math.sin(elapsed * 0.63) * 0.004 * idle;
    rig.updateMatrices();
    const head = rig.layers[1],
      light = rig.layers[3];
    uniforms.pointer.value.set(
      light.x * range + Math.sin(elapsed * 0.63) * 0.025 * idle,
      light.y * range,
    );
    uniforms.rimPointer.value.set(head.x, head.y);
    uniforms.breath.value = 1.02 + Math.sin(elapsed * 0.63) * 0.02 * idle;
    uniforms.energy.value = 1 + Math.min(1, Math.hypot(light.x, light.y)) * 0.1;
    draw();
  }
  const sync = () => {
    stop();
    if (!ready || disposed || lost) return;
    if (reduce.matches) {
      neutral();
      container.dataset.motion = 'static';
      container.dataset.renderer = 'three';
      // A single neutral dimensional frame, with no idle, distortion or tracking.
      if (inView && !document.hidden) draw();
      return;
    }
    container.dataset.renderer = 'three';
    if (document.hidden || !inView) {
      container.dataset.motion = 'paused';
      return;
    }
    container.dataset.motion = 'interactive';
    draw();
    if (!ready || lost) return;
    gsap.ticker.add(tick);
    ticking = true;
  };
  const resize = () => {
    if (!renderer || disposed || lost) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) {
      stop();
      return;
    }
    const low = compact.matches || coarse.matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1.25 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const viewHeight = Math.max(2.5, 2 / camera.aspect) * 1.03;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(viewHeight / (2 * PORTRAIT_CAMERA_Z)));
    camera.updateProjectionMatrix();
    if (meshes.length && lastCompact !== low) {
      geometry?.dispose();
      geometry = createRelief(low, alpha);
      meshes.forEach((mesh) => {
        mesh.geometry = geometry!;
      });
    }
    lastCompact = low;
    container.dataset.quality = low ? 'compact' : 'desktop';
    draw();
    sync();
  };
  const move = (event: PointerEvent) => {
    if (reduce.matches) return;
    if (event.pointerType === 'touch' || (coarse.matches && event.pointerType === 'pen')) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (gesture.intent === 'pending' && Math.hypot(dx, dy) >= 6) {
        gesture.intent = Math.abs(dx) > Math.abs(dy) * 1.1 ? 'horizontal' : 'scroll';
      }
      if (gesture.intent !== 'horizontal') return;
      targetX = curvePointer(dx / 110);
      // Pitch follows an intentional diagonal drag; native vertical panning wins otherwise.
      targetY = curvePointer(dy / 140);
      active = 1;
      return;
    }
    if (gesture) return;
    touchInput = false;
    const rect = hero.getBoundingClientRect();
    targetX = curvePointer(normalizePointer(event.clientX, rect.left, rect.width));
    targetY = curvePointer(normalizePointer(event.clientY, rect.top, rect.height));
    active = 1;
  };
  const leave = () => {
    gesture = null;
    targetX = targetY = active = 0;
  };
  const down = (event: PointerEvent) => {
    if (reduce.matches || event.isPrimary === false || gesture) return;
    if (event.pointerType !== 'touch' && !(coarse.matches && event.pointerType === 'pen')) return;
    touchInput = true;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, intent: 'pending' };
    targetX = targetY = active = 0;
  };
  const release = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) leave();
  };
  const visibility = () => {
    leave();
    sync();
  };
  const preference = () => {
    leave();
    resize();
    sync();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
    container.dataset.renderer = 'fallback';
  };
  const contextRestored = () => {
    lost = false;
    resize();
    sync();
  };
  const observer = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) leave();
      sync();
    },
    { threshold: 0.01 },
  );

  container.dataset.renderer = 'fallback';
  try {
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    if (context) {
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.debug.onShaderError = () => {
        ready = false;
        stop();
        container.dataset.renderer = 'fallback';
      };
      lastCompact = compact.matches || coarse.matches;
      geometry = createRelief(lastCompact);
      for (let layer = 0; layer < 3; layer++) {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            ...uniforms,
            layer: { value: layer },
            opticalMatrix: { value: rig.layers[layer === 2 ? 4 : 3].matrix },
          },
          transparent: true,
          depthWrite: false,
          blending: layer ? THREE.AdditiveBlending : THREE.NormalBlending,
          vertexShader: portraitVertexShader,
          fragmentShader: portraitFragmentShader,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = ['continuous-relief', 'spectral-light', 'front-energy'][layer];
        mesh.renderOrder = layer;
        // Shader deformation extends beyond the neutral CPU bounds.
        mesh.frustumCulled = false;
        materials.push(material);
        meshes.push(mesh);
        scene.add(mesh);
      }
      new THREE.TextureLoader().load(
        '/hero-three/hero-spectral.webp',
        (loaded) => {
          if (disposed) {
            loaded.dispose();
            return;
          }
          texture = loaded;
          // Read alpha once for geometry; transparent background vertices have zero depth.
          const image = loaded.image as HTMLImageElement | undefined;
          if (image?.width && image?.height) {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = image.width;
            maskCanvas.height = image.height;
            const maskContext = maskCanvas.getContext('2d');
            if (maskContext) {
              maskContext.drawImage(image, 0, 0);
              alpha = {
                pixels: maskContext.getImageData(0, 0, image.width, image.height).data,
                width: image.width,
                height: image.height,
              };
              geometry?.dispose();
              geometry = createRelief(lastCompact, alpha);
              meshes.forEach((mesh) => {
                mesh.geometry = geometry!;
              });
            }
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(4, renderer!.capabilities.getMaxAnisotropy());
          uniforms.portrait.value = texture;
          ready = true;
          resize();
        },
        undefined,
        () => {
          if (!disposed) container.dataset.renderer = 'fallback';
        },
      );
      resize();
    }
  } catch {
    container.dataset.renderer = 'fallback';
  }
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerdown', down, { passive: true });
  hero.addEventListener('pointerenter', move, { passive: true });
  hero.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  reduce.addEventListener('change', preference);
  coarse.addEventListener('change', preference);
  compact.addEventListener('change', preference);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  observer.observe(container);
  intersection.observe(hero);

  return () => {
    disposed = true;
    if (ticking) stop();
    observer.disconnect();
    intersection.disconnect();
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerdown', down);
    hero.removeEventListener('pointerenter', move);
    hero.removeEventListener('pointerleave', leave);
    window.removeEventListener('blur', leave);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    document.removeEventListener('visibilitychange', visibility);
    reduce.removeEventListener('change', preference);
    coarse.removeEventListener('change', preference);
    compact.removeEventListener('change', preference);
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeEventListener('webglcontextrestored', contextRestored);
    geometry?.dispose();
    materials.forEach((material) => material.dispose());
    texture?.dispose();
    scene.clear();
    renderer?.dispose();
    renderer?.forceContextLoss();
    canvas.remove();
    delete container.dataset.renderer;
    delete container.dataset.motion;
    delete container.dataset.quality;
  };
}
