

import React, { useRef, useEffect, forwardRef } from 'react';
import { ScaffoldParams } from '../types';
import { drawScaffold } from '../utils/drawing';

interface CanvasRendererProps {
  params: ScaffoldParams;
}

export const CanvasRenderer = forwardRef<HTMLCanvasElement, CanvasRendererProps>(({ params }, ref) => {
  // Use a local ref if an external one isn't provided.
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set a fixed internal resolution for drawing
    canvas.width = 512;
    canvas.height = 512;

    drawScaffold(ctx, params);

  }, [params, canvasRef]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain rounded-md bg-black" />;
});