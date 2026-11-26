import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../engine/SceneManager.ts';

interface Stage3DProps {
  onManagerReady: (manager: SceneManager | null) => void;
}

/**
 * Full-bleed persistent WebGL canvas host.
 * Maintains a single Three.js SceneManager across all views to prevent iPad Safari
 * WebGL context exhaustion while delivering 60fps 3D rendering.
 */
export const Stage3D: React.FC<Stage3DProps> = ({ onManagerReady }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let manager: SceneManager | null = null;
    try {
      manager = new SceneManager(canvas);
      onManagerReady(manager);
    } catch (err) {
      console.error('WebGL SceneManager init failed:', err);
      onManagerReady(null);
    }

    return () => {
      onManagerReady(null);
      manager?.dispose();
    };
  }, [onManagerReady]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block touch-none select-none z-0"
      aria-label="Interactive 3D Moroccan Darija Playworld"
    />
  );
};
