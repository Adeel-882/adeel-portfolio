import * as THREE from 'three';
import {
  PORTRAIT_CAMERA_Z,
  PORTRAIT_LAYERS,
  portraitDepth,
  portraitZones,
} from './spectral-relief';

export type PortraitAlpha = { pixels: Uint8ClampedArray; width: number; height: number };

export function createRelief(compact: boolean, alpha?: PortraitAlpha) {
  const geometry = new THREE.PlaneGeometry(2, 2.5, compact ? 64 : 112, compact ? 80 : 140);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const zones = new Float32Array(positions.count * 3);
  const stepX = alpha ? alpha.width / (compact ? 64 : 112) : 0;
  const stepY = alpha ? alpha.height / (compact ? 80 : 140) : 0;
  for (let i = 0; i < positions.count; i++) {
    const u = uv.getX(i),
      v = 1 - uv.getY(i);
    // Extend depth two cells UNDER the transparent margin. A hard alpha-to-Z drop
    // directly on the contour produces stair-stepped ears/jaws when turned.
    // Fragment alpha still clips the exact original silhouette; distant background stays flat.
    let a = alpha ? 0 : 1;
    if (alpha) {
      for (let dy = -2; dy <= 2 && a < 1; dy++) {
        for (let dx = -2; dx <= 2 && a < 1; dx++) {
          const x = Math.max(
            0,
            Math.min(alpha.width - 1, Math.round(u * (alpha.width - 1) + dx * stepX)),
          );
          const y = Math.max(
            0,
            Math.min(alpha.height - 1, Math.round(v * (alpha.height - 1) + dy * stepY)),
          );
          a = Math.max(a, alpha.pixels[(y * alpha.width + x) * 4 + 3] / 255);
        }
      }
    }
    const depth = portraitDepth(u, v) * a;
    const compensation = 1 - depth / PORTRAIT_CAMERA_Z;
    positions.setXYZ(i, positions.getX(i) * compensation, positions.getY(i) * compensation, depth);
    zones.set(portraitZones(u, v), i * 3);
  }
  geometry.setAttribute('zones', new THREE.BufferAttribute(zones, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createPortraitRig() {
  const root = new THREE.Group();
  root.name = 'spectral-depth-rig';
  // Put the axis behind the upper neck: the hair/ear contour must turn too,
  // rather than sitting on the axis while only the raised face moves.
  const headPivot = new THREE.Vector3(0, -0.42, -0.28);
  const bustPivot = new THREE.Vector3(0, -0.42, 0.08);
  const groups = PORTRAIT_LAYERS.map(() => new THREE.Group());
  const layers = PORTRAIT_LAYERS.map((config, index) => {
    const group = groups[index];
    group.name = config.name;
    const pivot = index === 0 ? bustPivot : headPivot;
    if (index < 2) {
      group.position.copy(pivot);
      root.add(group);
    } else {
      groups[1].add(group);
    }
    return {
      ...config,
      group,
      basePosition: group.position.clone(),
      inversePivot: new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z),
      matrix: new THREE.Matrix4(),
      x: 0,
      y: 0,
    };
  });
  function updateMatrices() {
    root.updateMatrixWorld(true);
    layers.forEach((layer) =>
      layer.matrix.multiplyMatrices(layer.group.matrixWorld, layer.inversePivot),
    );
  }
  updateMatrices();
  return { root, layers, updateMatrices };
}

// Smooth matrix weights keep the neck/face surface continuous instead of cutting it into cards.
export const portraitVertexShader = `
  attribute vec3 zones;
  uniform mat4 rearMatrix;
  uniform mat4 headMatrix;
  uniform mat4 faceMatrix;
  uniform mat4 opticalMatrix;
  uniform float layer;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vec3 p = position;
    float lift = layer * 0.012;
    p.xy *= (4.5 - p.z - lift) / (4.5 - p.z);
    p.z += lift;
    vec4 rear = rearMatrix * vec4(p, 1.0);
    vec4 head = headMatrix * vec4(p, 1.0);
    vec4 face = mix(faceMatrix * vec4(p, 1.0), opticalMatrix * vec4(p, 1.0), min(layer, 1.0));
    vec4 posed = rear * zones.x + head * zones.y + face * zones.z;
    vec4 view = modelViewMatrix * posed;
    vPosition = view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

export const portraitFragmentShader = `
  uniform sampler2D portrait;
  uniform vec2 pointer;
  uniform vec2 rimPointer;
  uniform float breath;
  uniform float energy;
  uniform float layer;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vec4 source = texture2D(portrait, vUv);
    if (source.a < 0.005) discard;
    vec2 faceCoord = (vUv - vec2(0.55, 0.55)) / vec2(0.25, 0.29);
    float region = 1.0 - smoothstep(0.35, 1.0, length(faceCoord));
    float light = smoothstep(0.07, 0.65, max(source.r, max(source.g, source.b))) * region;
    // UV sampling runs opposite to the visible motion: light slides toward the pointer.
    vec2 shift = pointer * vec2(-5.0 / 960.0, 3.0 / 1200.0) * region;
    vec2 chromatic = pointer * vec2(1.2 / 960.0, -0.45 / 1200.0) * region;
    vec3 optical = texture2D(portrait, vUv + shift).rgb;
    optical.r = texture2D(portrait, vUv + shift + chromatic).r;
    optical.b = texture2D(portrait, vUv + shift - chromatic).b;
    vec3 color = mix(source.rgb, optical, region) * mix(1.0, breath * energy, light);
    if (layer > 0.5) {
      // Two faint surface-bound emission passes; no duplicated opaque silhouette.
      float hot = smoothstep(layer > 1.5 ? 0.6 : 0.2, 0.95, max(source.r, max(source.g, source.b)));
      gl_FragColor = vec4(color, source.a * region * hot * (layer > 1.5 ? 0.025 : 0.045));
    } else {
      vec3 n = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
      float curvature = pow(1.0 - abs(n.z), 1.5);
      float side = (vUv.x - 0.5) * 2.0;
      float direction = smoothstep(-0.1, 0.6, side * sign(rimPointer.x));
      float rim = curvature * direction * abs(rimPointer.x) * (1.0 - region);
      color += vec3(0.003, 0.028, 0.20) * rim * 0.22;
      color += vec3(0.12, 0.014, 0.002) * curvature * (1.0 - direction) * abs(rimPointer.x) * 0.018 * (1.0 - region);
      gl_FragColor = vec4(color, source.a);
    }
    #include <colorspace_fragment>
  }
`;
