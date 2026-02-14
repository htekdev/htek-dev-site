import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Modern gradient mesh — clean, premium feel inspired by Linear/Vercel.
 * A single full-screen shader with slowly morphing gradients,
 * subtle noise texture, and gentle mouse parallax.
 * No particles, no blobs — just beautiful light.
 */

function GradientMesh() {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;

      // Simplex-ish noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                     + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;

        // Mouse influence — subtle warp
        vec2 mouse = uMouse * 0.08;
        uv += mouse * (1.0 - length(uv - 0.5));

        float t = uTime * 0.08;

        // Layered noise for organic movement
        float n1 = snoise(uv * 1.5 + t * 0.5);
        float n2 = snoise(uv * 2.5 - t * 0.3 + 3.0);
        float n3 = snoise(uv * 4.0 + t * 0.2 + 7.0);
        float noise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

        // Color palette — your brand: cyan, violet, rose
        vec3 cyan = vec3(0.345, 0.651, 1.0);     // #58a6ff
        vec3 violet = vec3(0.737, 0.549, 1.0);    // #bc8cff
        vec3 rose = vec3(0.969, 0.506, 0.400);    // #f78166
        vec3 dark = vec3(0.051, 0.067, 0.090);    // #0d1117

        // Gradient regions with noise displacement
        float g1 = smoothstep(-0.3, 0.6, noise + uv.x * 0.5 - uv.y * 0.3);
        float g2 = smoothstep(-0.2, 0.7, noise - uv.x * 0.3 + uv.y * 0.6);

        vec3 color = dark;
        color = mix(color, cyan * 0.25, g1 * 0.6);
        color = mix(color, violet * 0.2, g2 * 0.5);
        color = mix(color, rose * 0.15, (1.0 - g1) * g2 * 0.4);

        // Subtle grain for texture
        float grain = (snoise(vUv * 300.0 + uTime) * 0.5 + 0.5) * 0.015;
        color += grain;

        // Vignette — darken edges
        float vig = 1.0 - smoothstep(0.3, 0.85, length(vUv - 0.5));
        color *= 0.7 + vig * 0.3;

        gl_FragColor = vec4(color, 1.0);
      }`,
  }), []);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    // Smooth mouse tracking
    const u = mat.uniforms.uMouse.value as THREE.Vector2;
    u.x += (pointer.x - u.x) * 0.03;
    u.y += (pointer.y - u.y) * 0.03;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 50 }}
      gl={{ alpha: true }}
      dpr={[1, 2]}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <GradientMesh />
    </Canvas>
  );
}
