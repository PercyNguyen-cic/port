import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from '../lib/motionStore';
import { prefersReducedMotion } from '../lib/gsap';

const vertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Domain-warped fbm reads as ink clouding through water. The cursor parts the ink and
// lights it slightly; scroll offsets the field (parallax) and scroll speed stirs it.
const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uScroll;
  uniform float uStir;
  uniform vec2 uMouse;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.045;
    vec2 field = p * 1.35 + vec2(0.0, uScroll * 0.00035);

    // The cursor pushes ink away from itself.
    vec2 toMouse = p - m;
    float near = exp(-dot(toMouse, toMouse) * 7.0);
    field += normalize(toMouse + 1e-4) * near * 0.18;

    vec2 q = vec2(fbm(field + vec2(0.0, t)), fbm(field + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(field + (3.2 + uStir) * q + vec2(1.7, 9.2) + t * 1.4),
      fbm(field + (3.2 + uStir) * q + vec2(8.3, 2.8) - t * 1.1)
    );
    float f = fbm(field + 3.6 * r);

    vec3 lamp = vec3(0.035, 0.032, 0.036);
    vec3 oxblood = vec3(0.30, 0.045, 0.05);
    vec3 umber = vec3(0.12, 0.07, 0.06);
    vec3 paper = vec3(0.92, 0.90, 0.86);

    vec3 col = lamp;
    col = mix(col, umber, smoothstep(0.35, 0.8, f) * 0.55);
    col = mix(col, oxblood, smoothstep(0.55, 0.95, f * (0.6 + r.x)) * 0.75);
    col = mix(col, lamp * 0.4, smoothstep(0.25, 0.75, length(q) - 0.35) * 0.65);
    col += paper * pow(smoothstep(0.62, 1.0, f * r.y * 1.25), 3.0) * 0.08;
    col += paper * near * 0.035;

    // Vignette and film grain.
    col *= 1.0 - 0.55 * smoothstep(0.35, 1.05, length((uv - 0.5) * vec2(aspect * 0.8, 1.0)));
    col += (hash(gl_FragCoord.xy + fract(uTime) * 97.0) - 0.5) * 0.035;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function InkPlane({ still }) {
  const material = useRef(null);
  const { size, gl } = useThree();
  const smooth = useRef({ x: 0.5, y: 0.5, stir: 0, scroll: 0 });

  const uniforms = useMemo(
    () => ({
      uRes: { value: [1, 1] },
      uTime: { value: 12.0 },
      uScroll: { value: 0 },
      uStir: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
    }),
    []
  );

  useFrame((_, delta) => {
    const u = material.current.uniforms;
    const dpr = gl.getPixelRatio();
    u.uRes.value = [size.width * dpr, size.height * dpr];
    if (still) return;
    const s = smooth.current;
    const k = 1 - Math.exp(-delta * 3.5); // frame-rate independent easing
    s.x += (motion.mouse.x - s.x) * k;
    s.y += (motion.mouse.y - s.y) * k;
    s.scroll += (motion.scroll - s.scroll) * k;
    s.stir += (Math.min(Math.abs(motion.velocity) / 40, 1.2) - s.stir) * (1 - Math.exp(-delta * 2));
    u.uTime.value += delta;
    u.uMouse.value = [s.x, s.y];
    u.uScroll.value = s.scroll;
    u.uStir.value = s.stir;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

/** Fixed full-screen canvas behind every page. */
export function InkBackground() {
  const still = prefersReducedMotion();
  return (
    <div className="webgl-bg" aria-hidden="true">
      <Canvas
        dpr={[0.75, 1]}
        frameloop={still ? 'demand' : 'always'}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1] }}
      >
        <InkPlane still={still} />
      </Canvas>
    </div>
  );
}
