import { vertexShader, fragmentShader } from './gradient-wave-shaders';
import { colors } from './colors';

export const WAVE_COLORS = [
  colors.bg,
  colors['bg-deep'],
  colors.primary,
  colors['text-secondary'],
  colors.flare,
  colors.solar,
];
// Exposure belongs to the atmosphere, not the shared UI palette.
// Orange/cream are narrow, dim noise peaks rather than broad colored fills.
export const WAVE_EXPOSURES = [1, 0.55, 0.16, 0.2, 0.12];
export type Vec2 = [number, number];
export interface WaveDeform {
  incline?: number;
  offsetTop?: number;
  offsetBottom?: number;
  noiseFreq?: Vec2;
  noiseAmp?: number;
  noiseSpeed?: number;
  noiseFlow?: number;
  noiseSeed?: number;
}
export interface WaveOptions {
  colors?: string[];
  shadowPower?: number;
  darkenTop?: boolean;
  noiseSpeed?: number;
  noiseFrequency?: Vec2;
  deform?: WaveDeform;
}
class Uniform<T> {
  constructor(public value: T) {}
}
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** Typed, single-plane adaptation of the supplied MiniGl / Gradient renderer. */
export class Gradient {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private shaders: WebGLShader[] = [];
  private buffers: WebGLBuffer[] = [];
  private locations = new Map<string, WebGLUniformLocation | null>();
  private indexCount = 0;
  private width = 0;
  private height = 0;
  private dpr = 0;
  private mobile = false;
  private animationId = 0;
  private last = 0;
  private time = 120000;
  private disposed = false;
  private playing = false;
  readonly uniforms = {
    u_vertDeform: new Uniform({
      incline: new Uniform(0.16),
      offsetTop: new Uniform(-0.5),
      offsetBottom: new Uniform(-0.5),
      noiseFreq: new Uniform<Vec2>([3, 4]),
      noiseAmp: new Uniform(200),
      noiseSpeed: new Uniform(7),
      noiseFlow: new Uniform(3),
      noiseSeed: new Uniform(5),
    }),
  };

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    try {
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Shader allocation failed');
        this.shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
        return shader;
      };
      this.program = gl.createProgram();
      if (!this.program) throw new Error('Program allocation failed');
      gl.attachShader(this.program, compile(gl.VERTEX_SHADER, vertexShader));
      gl.attachShader(this.program, compile(gl.FRAGMENT_SHADER, fragmentShader));
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(this.program) || 'Program linking failed');
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(this.location('modelViewMatrix'), false, identity);
      this.configure({});
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  private location(name: string) {
    if (!this.locations.has(name))
      this.locations.set(name, this.gl.getUniformLocation(this.program!, name));
    return this.locations.get(name)!;
  }
  private float(name: string, value: number) {
    this.gl.uniform1f(this.location(name), value);
  }
  private vec2(name: string, value: Vec2) {
    this.gl.uniform2fv(this.location(name), value);
  }

  configure(options: WaveOptions) {
    const gl = this.gl;
    gl.useProgram(this.program);
    const colors = options.colors ?? WAVE_COLORS;
    if (
      colors.length < 2 ||
      colors.length > 8 ||
      colors.some((color) => !/^#[\da-f]{6}$/i.test(color))
    )
      throw new Error('Use 2–8 six-digit hex colors');
    const rgb = (hex: string) => {
      const value = parseInt(hex.slice(1), 16);
      return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
    };
    gl.uniform1i(this.location('u_colorCount'), colors.length);
    gl.uniform3fv(this.location('u_baseColor'), rgb(colors[0]));
    // Seven declared layers support eight colors without vec4 indexing or shader recreation.
    for (let i = 0; i < 7; i++) {
      const n = i + 1;
      const prefix = `u_waveLayers[${i}]`;
      const base = rgb(colors[0]);
      const exposure = WAVE_EXPOSURES[i] ?? 0.12;
      const light = rgb(colors[n] ?? colors[0]).map(
        (channel, index) => base[index] + (channel - base[index]) * exposure,
      );
      gl.uniform3fv(this.location(`${prefix}.color`), light);
      this.vec2(`${prefix}.noiseFreq`, [2 + n / colors.length, 3 + n / colors.length]);
      this.float(`${prefix}.noiseSpeed`, 11 + 0.3 * n);
      this.float(`${prefix}.noiseFlow`, 6.5 + 0.3 * n);
      this.float(`${prefix}.noiseSeed`, 5 + 10 * n);
      this.float(`${prefix}.noiseFloor`, i >= 3 ? 0.52 : 0.1);
      this.float(`${prefix}.noiseCeil`, 0.63 + 0.07 * n);
    }
    this.float('u_shadow_power', options.shadowPower ?? 8);
    this.float('u_darken_top', options.darkenTop === false ? 0 : 1);
    this.float('u_global.noiseSpeed', options.noiseSpeed ?? 0.000005);
    this.vec2('u_global.noiseFreq', options.noiseFrequency ?? [0.00008, 0.00035]);
    const d = this.uniforms.u_vertDeform.value;
    const values = options.deform ?? {};
    // Preserve Uniform identity. Replacing wrappers with primitives breaks updates.
    d.incline.value = values.incline ?? 0.16;
    d.offsetTop.value = values.offsetTop ?? -0.5;
    d.offsetBottom.value = values.offsetBottom ?? -0.5;
    d.noiseFreq.value = values.noiseFreq ?? [3, 4];
    d.noiseAmp.value = values.noiseAmp ?? 200;
    d.noiseSpeed.value = values.noiseSpeed ?? 7;
    d.noiseFlow.value = values.noiseFlow ?? 3;
    d.noiseSeed.value = values.noiseSeed ?? 5;
    for (const [name, uniform] of Object.entries(d)) {
      if (Array.isArray(uniform.value)) this.vec2(`u_vertDeform.${name}`, uniform.value);
      else this.float(`u_vertDeform.${name}`, uniform.value);
    }
  }

  resize(width: number, height: number, pixelRatio = 1) {
    if (width <= 0 || height <= 0) return;
    const mobile = width <= 800;
    // Also cap the backing store area on very large displays.
    const dpr = Math.min(pixelRatio, mobile ? 1 : 1.5, Math.sqrt(3500000 / (width * height)));
    if (width === this.width && height === this.height && dpr === this.dpr) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.mobile = mobile;
    const gl = this.gl;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    this.vec2('resolution', [width, height]);
    this.vec2('u_drawingSize', [this.canvas.width, this.canvas.height]);
    gl.uniformMatrix4fv(this.location('projectionMatrix'), false, [
      2 / width,
      0,
      0,
      0,
      0,
      2 / height,
      0,
      0,
      0,
      0,
      -0.001,
      0,
      0,
      0,
      0,
      1,
    ]);
    const xs = Math.max(12, Math.min(mobile ? 32 : 80, Math.ceil(width / 24)));
    const ys = Math.max(12, Math.min(mobile ? 24 : 48, Math.ceil(height / (mobile ? 40 : 24))));
    const count = (xs + 1) * (ys + 1);
    const positions = new Float32Array(count * 3);
    const uv = new Float32Array(count * 2);
    const norm = new Float32Array(count * 2);
    const indices = new Uint16Array(xs * ys * 6);
    for (let y = 0; y <= ys; y++)
      for (let x = 0; x <= xs; x++) {
        const i = y * (xs + 1) + x;
        positions.set([(x / xs - 0.5) * width, (0.5 - y / ys) * height, 0], i * 3);
        uv.set([x / xs, 1 - y / ys], i * 2);
        norm.set([(x / xs) * 2 - 1, 1 - (y / ys) * 2], i * 2);
        if (x < xs && y < ys)
          indices.set([i, i + xs + 1, i + 1, i + 1, i + xs + 1, i + xs + 2], (y * xs + x) * 6);
      }
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    this.buffers = [];
    const bind = (values: Float32Array | Uint16Array, name?: string, size = 2) => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error('Buffer allocation failed');
      this.buffers.push(buffer);
      const target = name ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER;
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, values, gl.STATIC_DRAW);
      if (name) {
        const location = gl.getAttribLocation(this.program!, name);
        if (location >= 0) {
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        }
      }
    };
    bind(positions, 'position', 3);
    bind(uv, 'uv');
    bind(norm, 'uvNorm');
    bind(indices);
    this.indexCount = indices.length;
    this.render();
  }

  render() {
    if (this.disposed || !this.indexCount || this.gl.isContextLost()) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    this.float('u_time', this.time);
    gl.clearColor(3 / 255, 3 / 255, 3 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }
  private animate = (timestamp: number) => {
    if (!this.playing || this.disposed) return;
    if (!this.last) this.last = timestamp;
    const delta = timestamp - this.last;
    if (delta >= 1000 / (this.mobile ? 24 : 30)) {
      this.time += Math.min(delta, 80) * (this.mobile ? 0.65 : 1);
      this.last = timestamp;
      this.render();
    }
    this.animationId = requestAnimationFrame(this.animate);
  };
  start() {
    if (this.playing || this.disposed) return;
    this.playing = true;
    this.last = 0;
    this.animationId = requestAnimationFrame(this.animate);
  }
  stop() {
    this.playing = false;
    cancelAnimationFrame(this.animationId);
    this.animationId = 0;
    this.last = 0;
  }
  dispose(releaseContext = false) {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.buffers.forEach((buffer) => this.gl.deleteBuffer(buffer));
    this.shaders.forEach((shader) => this.gl.deleteShader(shader));
    if (this.program) this.gl.deleteProgram(this.program);
    if (releaseContext) this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
