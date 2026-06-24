"use client";

import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type DottedSurfaceProps = Omit<ComponentProps<"div">, "ref"> & {
  settleProgress?: number;
  growProgress?: number;
};

type CameraLike = {
  aspect: number;
  fov: number;
  position: { x: number; y: number; z: number };
  lookAt: (x: number, y: number, z: number) => void;
  updateProjectionMatrix: () => void;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  setPixelRatio: (value: number) => void;
  setClearColor: (color: number, alpha?: number) => void;
  setSize: (width: number, height: number) => void;
  render: (scene: unknown, camera: unknown) => void;
  dispose: () => void;
};

type PositionAttributeLike = {
  array: Float32Array;
  needsUpdate: boolean;
};

type GeometryLike = {
  setAttribute: (name: string, attribute: unknown) => void;
  getAttribute: (name: string) => PositionAttributeLike | undefined;
  computeBoundingSphere: () => void;
  dispose: () => void;
};

type MaterialLike = {
  size: number;
  dispose: () => void;
};

type TextureLike = {
  dispose: () => void;
};

type SurfaceScene = {
  camera: CameraLike;
  renderer: RendererLike;
  geometry: GeometryLike;
  material: MaterialLike;
  texture: TextureLike;
  animationId: number;
};

const GRID_STEP = 48;
const GRID_OFFSET = GRID_STEP / 2;
const START_DOT_SIZE = 8;
const END_DOT_SIZE = 64;
const BACKGROUND_HEX = 0x20201f;
const DOT_HEX = 0xfe3b2e;
const CAMERA_Y = 180;
const CAMERA_Z = 1220;
const WAVE_SEPARATION = 150;
const WAVE_AMPLITUDE = 50;
const PARTICLE_STAGGER = 1.1;
const PARTICLE_DRIFT_X = 148;
const PARTICLE_DRIFT_Y_MIN = 48;
const PARTICLE_DRIFT_Y_MAX = 236;
const PARTICLE_DRIFT_Z = 248;
const DIRECTIONAL_WAVE_WEIGHT = 0.82;
const DIRECTIONAL_WAVE_JITTER = 0.18;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const fract = (value: number) => value - Math.floor(value);
const hash2D = (x: number, y: number, seed: number) =>
  fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123);

function createDotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function DottedSurface({
  className,
  children,
  settleProgress = 0,
  growProgress = 0,
  ...props
}: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settleProgressRef = useRef(settleProgress);
  const growProgressRef = useRef(growProgress);
  const sceneRef = useRef<SurfaceScene | null>(null);

  useEffect(() => {
    settleProgressRef.current = settleProgress;
  }, [settleProgress]);

  useEffect(() => {
    growProgressRef.current = growProgress;
  }, [growProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 4000) as CameraLike;
    camera.position.x = 0;
    camera.position.y = CAMERA_Y;
    camera.position.z = CAMERA_Z;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    }) as RendererLike;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(BACKGROUND_HEX, 1);
    renderer.domElement.className = "dotted-surface-canvas";
    container.appendChild(renderer.domElement);

    const texture = createDotTexture() as TextureLike;
    const geometry = new THREE.BufferGeometry() as GeometryLike;
    const material = new THREE.PointsMaterial({
      color: DOT_HEX,
      map: texture,
      alphaMap: texture,
      transparent: true,
      opacity: 1,
      size: START_DOT_SIZE,
      sizeAttenuation: false,
      depthWrite: false,
    }) as MaterialLike;
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let gridColumns = 0;
    let gridRows = 0;
    let gridWidth = 1;
    let gridHeight = 1;
    let anchorPositions = new Float32Array(0);
    let waveBasePositions = new Float32Array(0);
    let particleDelays = new Float32Array(0);
    let particleDrifts = new Float32Array(0);
    let animationId = 0;
    let time = 0;

    const screenToWorld = (screenX: number, screenY: number, width: number, height: number) => {
      const ndcX = (screenX / width) * 2 - 1;
      const ndcY = 1 - (screenY / height) * 2;
      const point = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera as never);
      const origin = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
      const direction = point.sub(origin).normalize();
      const distance = -origin.z / direction.z;
      return origin.add(direction.multiplyScalar(distance));
    };

    const rebuildGrid = (width: number, height: number) => {
      gridWidth = Math.max(width, 1);
      gridHeight = Math.max(height, 1);
      gridColumns = Math.ceil(gridWidth / GRID_STEP) + 2;
      gridRows = Math.ceil(gridHeight / GRID_STEP) + 2;

      camera.aspect = gridWidth / gridHeight;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      anchorPositions = new Float32Array(gridColumns * gridRows * 3);
      waveBasePositions = new Float32Array(gridColumns * gridRows * 3);
      particleDelays = new Float32Array(gridColumns * gridRows);
      particleDrifts = new Float32Array(gridColumns * gridRows * 3);
      const initialPositions = new Float32Array(anchorPositions.length);
      const waveCenterX = ((gridColumns - 1) * WAVE_SEPARATION) / 2;
      const waveCenterZ = ((gridRows - 1) * WAVE_SEPARATION) / 2;

      let pointIndex = 0;
      let pointer = 0;
      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          const screenX = GRID_OFFSET + column * GRID_STEP;
          const screenY = GRID_OFFSET + row * GRID_STEP;
          const worldPoint = screenToWorld(screenX, screenY, gridWidth, gridHeight);
          const waveX = column * WAVE_SEPARATION - waveCenterX;
          const waveZ = row * WAVE_SEPARATION - waveCenterZ;

          anchorPositions[pointer] = worldPoint.x;
          anchorPositions[pointer + 1] = worldPoint.y;
          anchorPositions[pointer + 2] = 0;

          waveBasePositions[pointer] = waveX;
          waveBasePositions[pointer + 1] = 0;
          waveBasePositions[pointer + 2] = waveZ;

          const delaySeed = hash2D(column, row, 1);
          const driftXSeed = hash2D(column, row, 2);
          const driftYSeed = hash2D(column, row, 3);
          const driftZSeed = hash2D(column, row, 4);
          const columnProgress = gridColumns > 1 ? column / (gridColumns - 1) : 0;
          const rowProgress = gridRows > 1 ? row / (gridRows - 1) : 0;
          const directionalDelay =
            ((columnProgress + rowProgress) * 0.5) * DIRECTIONAL_WAVE_WEIGHT;
          const jitterDelay = Math.pow(delaySeed, 0.48) * DIRECTIONAL_WAVE_JITTER;
          particleDelays[pointIndex] = Math.min(
            0.96,
            (directionalDelay + jitterDelay) * PARTICLE_STAGGER,
          );
          particleDrifts[pointer] = (driftXSeed - 0.5) * PARTICLE_DRIFT_X;
          particleDrifts[pointer + 1] = lerp(
            PARTICLE_DRIFT_Y_MIN,
            PARTICLE_DRIFT_Y_MAX,
            driftYSeed,
          );
          particleDrifts[pointer + 2] = (driftZSeed - 0.5) * PARTICLE_DRIFT_Z;

          initialPositions[pointer] = waveX;
          initialPositions[pointer + 1] = 0;
          initialPositions[pointer + 2] = waveZ;
          pointIndex += 1;
          pointer += 3;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(initialPositions, 3));
      geometry.computeBoundingSphere();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(gridWidth, gridHeight);
    };

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }

      const positions = geometry.getAttribute("position");
      if (!positions) {
        return;
      }

      const values = positions.array as Float32Array;
      const settle = smoothstep(clamp01(settleProgressRef.current));
      const sizeProgress = smoothstep(clamp01(growProgressRef.current));
      const waveStrength = prefersReducedMotion ? 0 : 1 - settle;

      let index = 0;
      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          const pointer = index * 3;
          const waveX = waveBasePositions[pointer];
          const waveZ = waveBasePositions[pointer + 2];
          const anchorX = anchorPositions[pointer];
          const anchorY = anchorPositions[pointer + 1];
          const delay = particleDelays[index];
          const particleSettle = smoothstep(clamp01((settle - delay) / Math.max(1 - delay, 0.0001)));
          const driftCurve = Math.sin(particleSettle * Math.PI);
          const liftCurve = 4 * particleSettle * (1 - particleSettle);
          const driftFade = 1 - particleSettle;
          const waveY =
            (Math.sin((column + time) * 0.3) * WAVE_AMPLITUDE +
              Math.sin((row + time) * 0.5) * WAVE_AMPLITUDE) *
            waveStrength;

          values[pointer] =
            lerp(waveX, anchorX, particleSettle) +
            particleDrifts[pointer] * driftCurve * driftFade;
          values[pointer + 1] =
            lerp(waveY, anchorY, particleSettle) +
            particleDrifts[pointer + 1] * liftCurve;
          values[pointer + 2] =
            lerp(waveZ, 0, particleSettle) +
            particleDrifts[pointer + 2] * driftCurve * driftFade;
          index += 1;
        }
      }

      positions.needsUpdate = true;
      material.size = lerp(START_DOT_SIZE, END_DOT_SIZE, sizeProgress);
      renderer.render(scene, camera);
      time += prefersReducedMotion ? 0 : 0.1;
    };

    const handleResize = () => {
      const width = Math.max(container.clientWidth, window.innerWidth);
      const height = Math.max(container.clientHeight, window.innerHeight);
      rebuildGrid(width, height);
    };

    sceneRef.current = {
      camera,
      renderer,
      geometry,
      material,
      texture,
      animationId,
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        window.cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.geometry.dispose();
        sceneRef.current.material.dispose();
        sceneRef.current.texture.dispose();
        sceneRef.current.renderer.dispose();

        if (container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
      }

      sceneRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("dotted-surface", className)} {...props}>
      <div className="dotted-surface-content">{children}</div>
    </div>
  );
}
