"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { RotateCw, Compass, Eye, Sparkles, Move3d } from "lucide-react";

type GeometryMode = "sphere" | "torus" | "polyhedron";
type RenderStyle = "all" | "wireframe" | "particles";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  a: number;
  b: number;
}

export function Interactive3DTransit() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<GeometryMode>("sphere");
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("all");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stateRef = useRef({
    rotX: 0.2,
    rotY: 0.3,
    targetRotX: 0.2,
    targetRotY: 0.3,
    autoRotate: true,
    lastMouseX: 0,
    lastMouseY: 0,
    pulseProgress: 0,
    pulseActive: false,
    particles: [] as Array<{ speed: number; radius: number; angle: number; axis: "x" | "y" | "z" }>,
    dust: [] as Array<{ x: number; y: number; z: number; size: number; alpha: number }>,
    hoverScale: 1,
  });

  // Initialize ambient 3D particles once
  useEffect(() => {
    const dust = [];
    for (let i = 0; i < 45; i++) {
      dust.push({
        x: (Math.random() - 0.5) * 450,
        y: (Math.random() - 0.5) * 450,
        z: (Math.random() - 0.5) * 450,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const orbitalParticles = [];
    for (let i = 0; i < 14; i++) {
      orbitalParticles.push({
        speed: (Math.random() * 0.015 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        radius: 115 + Math.random() * 30,
        angle: Math.random() * Math.PI * 2,
        axis: (["x", "y", "z"] as const)[Math.floor(Math.random() * 3)],
      });
    }

    stateRef.current.dust = dust;
    stateRef.current.particles = orbitalParticles;
  }, []);

  // Global window pointer & device tilt tracking
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w <= 0 || h <= 0) return;

      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;

      stateRef.current.targetRotY = nx * 0.9;
      stateRef.current.targetRotX = -ny * 0.6;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltX = Math.max(-1, Math.min(1, e.gamma / 40));
        const tiltY = Math.max(-1, Math.min(1, (e.beta - 40) / 40));
        stateRef.current.targetRotY = tiltX * 0.8;
        stateRef.current.targetRotX = tiltY * 0.6;
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  // Geometry computation
  const getGeometry = useCallback((currentMode: GeometryMode): { points: Point3D[]; edges: Edge[] } => {
    const points: Point3D[] = [];
    const edges: Edge[] = [];

    if (currentMode === "sphere") {
      const latBands = 8;
      const lonBands = 14;
      const radius = 110;

      for (let lat = 0; lat <= latBands; lat++) {
        const theta = (lat * Math.PI) / latBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon < lonBands; lon++) {
          const phi = (lon * 2 * Math.PI) / lonBands;
          const x = radius * Math.cos(phi) * sinTheta;
          const y = radius * cosTheta;
          const z = radius * Math.sin(phi) * sinTheta;
          points.push({ x, y, z });

          const curr = lat * lonBands + lon;
          const nextLon = lat * lonBands + ((lon + 1) % lonBands);
          edges.push({ a: curr, b: nextLon });

          if (lat < latBands) {
            const nextLat = (lat + 1) * lonBands + lon;
            edges.push({ a: curr, b: nextLat });
          }
        }
      }

      // Inner transit nexus
      const innerRadius = 40;
      const startInner = points.length;
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8;
        points.push({
          x: innerRadius * Math.cos(angle),
          y: i % 2 === 0 ? 15 : -15,
          z: innerRadius * Math.sin(angle),
        });
        edges.push({ a: startInner + i, b: startInner + ((i + 1) % 8) });
      }
    } else if (currentMode === "torus") {
      const ringSegments = 24;
      const rOuter = 115;
      const rInner = 80;
      const rTilt = 95;

      const start1 = points.length;
      for (let i = 0; i < ringSegments; i++) {
        const theta = (i * 2 * Math.PI) / ringSegments;
        points.push({ x: rOuter * Math.cos(theta), y: 0, z: rOuter * Math.sin(theta) });
        edges.push({ a: start1 + i, b: start1 + ((i + 1) % ringSegments) });
      }

      const start2 = points.length;
      for (let i = 0; i < ringSegments; i++) {
        const theta = (i * 2 * Math.PI) / ringSegments;
        points.push({ x: 0, y: rInner * Math.sin(theta), z: rInner * Math.cos(theta) });
        edges.push({ a: start2 + i, b: start2 + ((i + 1) % ringSegments) });
      }

      const start3 = points.length;
      for (let i = 0; i < ringSegments; i++) {
        const theta = (i * 2 * Math.PI) / ringSegments;
        const cx = rTilt * Math.cos(theta);
        const cy = rTilt * Math.sin(theta);
        points.push({
          x: cx * 0.707 - cy * 0.707,
          y: cx * 0.707 + cy * 0.707,
          z: cy * 0.5,
        });
        edges.push({ a: start3 + i, b: start3 + ((i + 1) % ringSegments) });
      }

      for (let i = 0; i < 6; i++) {
        const idx1 = start1 + (i * 4) % ringSegments;
        const idx2 = start2 + (i * 4) % ringSegments;
        edges.push({ a: idx1, b: idx2 });
      }
    } else {
      const phi = (1 + Math.sqrt(5)) / 2;
      const scale = 65;
      const baseVertices: [number, number, number][] = [
        [-1, phi, 0],
        [1, phi, 0],
        [-1, -phi, 0],
        [1, -phi, 0],
        [0, -1, phi],
        [0, 1, phi],
        [0, -1, -phi],
        [0, 1, -phi],
        [phi, 0, -1],
        [phi, 0, 1],
        [-phi, 0, -1],
        [-phi, 0, 1],
      ];

      baseVertices.forEach(([x, y, z]) => {
        points.push({ x: x * scale, y: y * scale, z: z * scale });
      });

      baseVertices.forEach(([x, y, z]) => {
        points.push({ x: x * scale * 1.45, y: y * scale * 1.45, z: z * scale * 1.45 });
      });

      for (let i = 0; i < 12; i++) {
        for (let j = i + 1; j < 12; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dz = points[i].z - points[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < scale * 2.1) {
            edges.push({ a: i, b: j });
          }
        }
      }

      for (let i = 0; i < 12; i++) {
        edges.push({ a: i, b: i + 12 });
      }
    }

    return { points, edges };
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(rect.width, 240);
      const h = Math.max(rect.height, 220);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const { points, edges } = getGeometry(mode);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;

      // Continuous ambient rotation
      if (state.autoRotate && !isDragging) {
        state.targetRotY += 0.007;
      }

      state.rotX += (state.targetRotX - state.rotX) * 0.08;
      state.rotY += (state.targetRotY - state.rotY) * 0.08;

      const targetScale = isHovered ? 1.05 : 1.0;
      state.hoverScale += (targetScale - state.hoverScale) * 0.1;

      if (state.pulseActive) {
        state.pulseProgress += dt * 1.6;
        if (state.pulseProgress >= 1) {
          state.pulseProgress = 0;
          state.pulseActive = false;
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Ambient radial spotlight
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(w, h) * 0.6);
      glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      glowGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);
      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);

      // Adaptive FOV scaling to guarantee 3D object fits screen
      const fov = Math.min(w, h, 380) * 0.95;

      // Draw dust
      for (const d of state.dust) {
        const x1 = d.x * cosY - d.z * sinY;
        const z1 = d.z * cosY + d.x * sinY;
        const y2 = d.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + d.y * sinX + 420;

        if (z2 > 10) {
          const scale = fov / z2;
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          const alpha = Math.max(0.08, Math.min(0.6, (z2 / 600) * d.alpha));
          ctx.beginPath();
          ctx.arc(px, py, d.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Projected vertices
      const projected = points.map((p) => {
        let px = p.x * state.hoverScale;
        let py = p.y * state.hoverScale;
        let pz = p.z * state.hoverScale;

        if (state.pulseActive) {
          const dist = Math.sqrt(px * px + py * py + pz * pz);
          const wave = Math.sin(dist * 0.05 - state.pulseProgress * Math.PI * 2);
          if (wave > 0) {
            const factor = 1 + wave * 0.15 * (1 - state.pulseProgress);
            px *= factor;
            py *= factor;
            pz *= factor;
          }
        }

        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;

        const zCam = z2 + 360;
        const scale = fov / Math.max(zCam, 20);

        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        };
      });

      // Draw Edges (Monochrome lines with high contrast)
      if (renderStyle !== "particles") {
        for (const edge of edges) {
          const p1 = projected[edge.a];
          const p2 = projected[edge.b];
          if (!p1 || !p2) continue;

          const avgZ = (p1.z + p2.z) / 2;
          const normalizedZ = (avgZ + 120) / 240;
          const alpha = Math.max(0.12, Math.min(0.85, normalizedZ * 0.75 + 0.1));

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = Math.max(0.75, (p1.scale + p2.scale) * 0.7);
          ctx.stroke();
        }
      }

      // Draw Vertices
      if (renderStyle !== "wireframe") {
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          const normalizedZ = (p.z + 120) / 240;
          const alpha = Math.max(0.25, Math.min(1.0, normalizedZ * 0.85 + 0.15));
          const nodeRadius = Math.max(1.8, p.scale * 3.0);

          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          if (normalizedZ > 0.55) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeRadius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(normalizedZ - 0.55) * 0.35})`;
            ctx.fill();
          }
        }
      }

      // Draw Orbiting Satellite Beacons
      for (const p of state.particles) {
        p.angle += p.speed;
        let ox = 0, oy = 0, oz = 0;
        if (p.axis === "y") {
          ox = p.radius * Math.cos(p.angle);
          oz = p.radius * Math.sin(p.angle);
        } else if (p.axis === "x") {
          oy = p.radius * Math.cos(p.angle);
          oz = p.radius * Math.sin(p.angle);
        } else {
          ox = p.radius * Math.cos(p.angle);
          oy = p.radius * Math.sin(p.angle);
        }

        const x1 = ox * cosY - oz * sinY;
        const z1 = oz * cosY + ox * sinY;
        const y2 = oy * cosX - z1 * sinX;
        const z2 = z1 * cosX + oy * sinX + 360;

        if (z2 > 20) {
          const scale = fov / z2;
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          const alpha = Math.max(0.3, Math.min(1, (z2 - 240) / 240));

          ctx.beginPath();
          ctx.arc(px, py, 3.2 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 7 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [mode, renderStyle, isHovered, isDragging, getGeometry]);

  // Touch & Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    stateRef.current.autoRotate = false;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
    stateRef.current.pulseActive = true;
    stateRef.current.pulseProgress = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - stateRef.current.lastMouseX;
    const dy = e.clientY - stateRef.current.lastMouseY;
    stateRef.current.targetRotY += dx * 0.009;
    stateRef.current.targetRotX += dy * 0.009;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetPerspective = () => {
    const state = stateRef.current;
    state.targetRotX = 0.2;
    state.targetRotY = 0.3;
    state.autoRotate = true;
    state.pulseActive = true;
    state.pulseProgress = 0;
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "pan-y" }}
      className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] flex items-center justify-center select-none overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.08)] cursor-grab active:cursor-grabbing"
    >
      {/* Background Matrix Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />

      {/* Top HUD */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-[10px] sm:text-[11px] font-mono tracking-wider text-zinc-300">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
          </span>
          <span>TRANSIT_3D</span>
        </div>
      </div>

      {/* Top Right: Drag Hint */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-[11px] text-zinc-400">
        <Move3d className="w-3 h-3 text-zinc-300" />
        <span>Drag to rotate</span>
      </div>

      {/* Bottom Floating Glass Dock */}
      <div
        className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Geometry Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/5">
          <button
            type="button"
            onClick={() => setMode("sphere")}
            className={`px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-medium rounded-lg transition-all ${
              mode === "sphere"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sphere
          </button>
          <button
            type="button"
            onClick={() => setMode("torus")}
            className={`px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-medium rounded-lg transition-all ${
              mode === "torus"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Rings
          </button>
          <button
            type="button"
            onClick={() => setMode("polyhedron")}
            className={`px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-medium rounded-lg transition-all ${
              mode === "polyhedron"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Nexus
          </button>
        </div>

        {/* Style & Reset */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-white/[0.04] border border-white/5">
            <button
              type="button"
              onClick={() => setRenderStyle("all")}
              title="Full Mesh"
              className={`p-1 sm:p-1.5 rounded-lg text-xs transition-colors ${
                renderStyle === "all" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRenderStyle("wireframe")}
              title="Wireframe Only"
              className={`p-1 sm:p-1.5 rounded-lg text-xs transition-colors ${
                renderStyle === "wireframe" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRenderStyle("particles")}
              title="Particle Nodes"
              className={`p-1 sm:p-1.5 rounded-lg text-xs transition-colors ${
                renderStyle === "particles" ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetPerspective}
            title="Reset Perspective"
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[11px] sm:text-xs font-medium text-white transition-all active:scale-95"
          >
            <RotateCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
