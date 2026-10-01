"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// The brand's lowercase icon-mark path, sampled into points and extruded into 3D.
const LOGO_PATH_D =
  "M20.6195 0H9.3624C8.91585 0 9.0049 0.383067 9.0049 0.855604V7.10328C9.0049 7.62861 9.40734 8.05447 9.90378 8.05447H19.077C21.1789 8.05447 22.8828 9.85753 22.8828 12.0817C22.8828 14.3059 20.7278 16.1089 18.626 16.1089H9.90378C9.40734 16.1089 9.0049 16.5348 9.0049 17.0601V23.3319C9.0049 23.9674 8.51808 24.4825 7.91755 24.4825H1.44981C0.6491 24.4825 0 25.1694 0 26.0167V30.6837C0 31.531 0.6491 32.2179 1.44981 32.2179H7.90578C8.5217 32.2179 9.02101 31.6895 9.02101 31.0378V25.6667C9.02101 25.0483 9.49267 24.547 10.0771 24.547H20.6204C27.0261 24.547 32.2179 19.0519 32.2179 12.2735C32.2179 5.49503 27.0251 0 20.6195 0Z";

function buildLogoShape(): THREE.Shape {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:absolute;left:-9999px;top:-9999px";
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", LOGO_PATH_D);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  const N = 320;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const p = path.getPointAtLength((len * i) / N);
    pts.push(new THREE.Vector2(p.x, -p.y));
  }
  document.body.removeChild(svg);
  return new THREE.Shape(pts);
}

function buildEnvTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d")!;
  const bg = x.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, "#000000");
  bg.addColorStop(0.5, "#050605");
  bg.addColorStop(1, "#080807");
  x.fillStyle = bg;
  x.fillRect(0, 0, 512, 256);

  const g = x.createLinearGradient(0, 46, 0, 88);
  g.addColorStop(0, "rgba(40,52,70,0)");
  g.addColorStop(0.5, "rgba(55,68,95,0.16)");
  g.addColorStop(1, "rgba(40,52,70,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 256);

  const gg = x.createRadialGradient(256, 235, 0, 256, 235, 250);
  gg.addColorStop(0, "rgba(14,42,70,0.16)");
  gg.addColorStop(1, "rgba(14,42,70,0)");
  x.fillStyle = gg;
  x.fillRect(0, 0, 512, 256);

  const rg = x.createRadialGradient(392, 60, 0, 392, 60, 60);
  rg.addColorStop(0, "rgba(70,85,95,0.18)");
  rg.addColorStop(1, "rgba(70,85,95,0)");
  x.fillStyle = rg;
  x.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

type ThreeLogoBackgroundProps = {
  logoMode: "hero" | "cta";
};

export function ThreeLogoBackground({ logoMode }: ThreeLogoBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const logoModeRef = useRef(logoMode);

  useEffect(() => {
    logoModeRef.current = logoMode;
  }, [logoMode]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    let disposed = false;
    let W = host.clientWidth;
    let H = host.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / (H || 1), 0.1, 200);
    camera.position.set(0, 0, 34);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = buildEnvTexture();
    const envMap = pmrem.fromEquirectangular(envTex).texture;
    scene.environment = envMap;
    envTex.dispose();
    pmrem.dispose();

    const shape = buildLogoShape();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 8,
      bevelEnabled: true,
      bevelThickness: 1.4,
      bevelSize: 1.0,
      bevelSegments: 4,
      curveSegments: 1,
      steps: 1,
    });
    geo.center();
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x3a3a3a,
      metalness: 0.0,
      roughness: 0.42,
      ior: 1.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      reflectivity: 0.1,
      emissive: 0x161616,
      emissiveIntensity: 0.35,
      envMapIntensity: 0.1,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const fresnelMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x8a8a8a) }, intensity: { value: 0.16 } },
      vertexShader:
        "varying float vF; void main(){ vec3 vn=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vec3 vd=normalize(-mv.xyz); vF=pow(1.0-abs(dot(vn,vd)),2.7); gl_Position=projectionMatrix*mv; }",
      fragmentShader:
        "uniform vec3 glowColor; uniform float intensity; varying float vF; void main(){ gl_FragColor=vec4(glowColor, vF*intensity); }",
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const fresnelMesh = new THREE.Mesh(geo, fresnelMat);
    fresnelMesh.renderOrder = 2;

    const group = new THREE.Group();
    group.add(mesh);
    group.add(fresnelMesh);
    group.position.x = 1.5;
    scene.add(group);

    scene.add(new THREE.AmbientLight(0x0e1218, 0.05));
    const key = new THREE.DirectionalLight(0xffffff, 0.26);
    key.position.set(2, 14, 10);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(0x8c8c8c, 0.18);
    rimLight.position.set(-6, 4, -10);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0x4a4a4a, 0.12);
    fillLight.position.set(-9, -6, 5);
    scene.add(fillLight);

    const baseScale = 0.44;
    let baseScaleCurrent = baseScale;

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    const cur = { fres: 0.95 };
    const lp = { x: 1.5, y: 5.0 };
    const baseY = 5.0;

    const resize = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      if (W === 0 || H === 0) return;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      baseScaleCurrent = baseScale * Math.min(1.15, Math.max(0.6, W / 1280));
      group.scale.setScalar(baseScaleCurrent);
    };
    window.addEventListener("resize", resize);

    let raf: number | null = null;
    const frame = () => {
      const t = clock.getElapsedTime();
      const cta = logoModeRef.current === "cta";
      const lgx = cta ? 8.6 : 1.5;
      const tyB = cta ? 0.4 : baseY;
      lp.x += (lgx - lp.x) * 0.07;
      lp.y += (tyB - lp.y) * 0.07;
      group.position.x = lp.x;

      if (!reduce) {
        group.rotation.y = t * 0.1;
        group.rotation.z = Math.sin(t * 0.07) * 0.12;
        group.rotation.x = -0.04 + Math.sin(t * 0.05) * 0.1;
        group.position.y = lp.y + Math.sin(t * 0.1) * 0.5;
      } else {
        group.rotation.set(-0.05, 0.5, 0);
        group.position.y = lp.y;
      }

      // Synced pulse originally driven by two CSS light-beam sweeps (13s/17s cycles). The beam elements
      // themselves aren't in the shipped markup, but this pulse still visibly animates the logo's glow.
      const beamPulse1 = reduce ? 0 : Math.max(0, 1 - Math.abs(((t % 13) / 13) - 0.5) * 9);
      const beamPulse2 = reduce ? 0 : Math.max(0, 1 - Math.abs(((t % 17) / 17) - 0.5) * 9);
      const beamGlow = Math.min(1, beamPulse1 * 0.8 + beamPulse2 * 0.55);
      fresnelMat.uniforms.intensity.value = cur.fres + beamGlow * 0.9;
      rimLight.intensity = 0.55 + beamGlow * 1.4;

      const baseS = baseScaleCurrent || baseScale;
      group.scale.setScalar(baseS);

      renderer.render(scene, camera);
    };

    let glVisible = true;
    const start = () => {
      if (raf || disposed) return;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        frame();
      };
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          glVisible = entries[0].isIntersecting;
          if (glVisible && !document.hidden) start();
          else stop();
        },
        { threshold: 0.01 }
      );
      io.observe(host);
    }
    const onVis = () => {
      if (document.hidden) stop();
      else if (glVisible) start();
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    try {
      frame();
    } catch {
      // ignore a failed first paint (e.g. zero-size host on first layout pass)
    }
    start();

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);

      geo.dispose();
      mat.dispose();
      fresnelMat.dispose();
      envMap.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
