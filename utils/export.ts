

import { ScaffoldParams } from '../types';

/**
 * Triggers a browser download for a PNG image from a canvas element.
 */
export function exportToPNG(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Generates and triggers a download for an STL file from a canvas heightmap.
 * Grayscale values are treated as height data.
 */
export function exportToSTL(canvas: HTMLCanvasElement, params: ScaffoldParams, filename:string) {
  const { thickness, width, height } = params;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;
  
  let stl = 'solid scaffold\n';

  const heights: number[][] = Array(canvasWidth).fill(0).map(() => Array(canvasHeight).fill(0));
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4;
      const grayValue = data[i]; 
      heights[x][y] = (grayValue / 255) * thickness;
    }
  }

  const addTriangle = (v1: number[], v2: number[], v3: number[]) => {
    const ux = v2[0] - v1[0], uy = v2[1] - v1[1], uz = v2[2] - v1[2];
    const vx = v3[0] - v1[0], vy = v3[1] - v1[1], vz = v3[2] - v1[2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;

    stl += `facet normal ${nx} ${ny} ${nz}\n`;
    stl += '  outer loop\n';
    stl += `    vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`;
    stl += `    vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`;
    stl += `    vertex ${v3[0]} ${v3[1]} ${v3[2]}\n`;
    stl += '  endloop\n';
    stl += 'endfacet\n';
  };

  const addQuad = (v1: number[], v2: number[], v3: number[], v4: number[]) => {
    addTriangle(v1, v2, v3);
    addTriangle(v1, v3, v4);
  };
  
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const h = heights[x][y];
      if (h <= 0) continue;

      const wx = x * scaleX;
      const wy = (canvasHeight - 1 - y) * scaleY; // Invert Y

      // Top face
      const p5 = [wx, wy, h];
      const p6 = [wx + scaleX, wy, h];
      const p7 = [wx + scaleX, wy + scaleY, h];
      const p8 = [wx, wy + scaleY, h];
      addQuad(p8, p7, p6, p5);
      
      // Get neighbor heights
      const h_left = x > 0 ? heights[x - 1][y] : 0;
      const h_right = x < canvasWidth - 1 ? heights[x + 1][y] : 0;
      const h_front = y > 0 ? heights[x][y - 1] : 0; // Inverted Y
      const h_back = y < canvasHeight - 1 ? heights[x][y + 1] : 0; // Inverted Y
      
      // Bottom face (only if it's the start of material)
      if(h > 0) {
        let isEdge = h_left === 0 || h_right === 0 || h_front === 0 || h_back === 0;
         if(!isEdge){
             const h_min_neighbor = Math.min(h_left, h_right, h_front, h_back);
             if(h > h_min_neighbor) isEdge = true; // on an internal cliff
         }

        if(isEdge) { // crude check for exposed bottom faces
            const p1 = [wx, wy, 0];
            const p2 = [wx + scaleX, wy, 0];
            const p3 = [wx + scaleX, wy + scaleY, 0];
            const p4 = [wx, wy + scaleY, 0];
            addQuad(p1, p2, p3, p4);
        }
      }

      // Left face wall
      if (h > h_left) {
        const v1 = [wx, wy, h_left];
        const v2 = [wx, wy, h];
        const v3 = [wx, wy + scaleY, h];
        const v4 = [wx, wy + scaleY, h_left];
        addQuad(v1, v2, v3, v4);
      }
      // Right face wall
      if (h > h_right) {
        const v1 = [wx + scaleX, wy, h];
        const v2 = [wx + scaleX, wy, h_right];
        const v3 = [wx + scaleX, wy + scaleY, h_right];
        const v4 = [wx + scaleX, wy + scaleY, h];
        addQuad(v1, v2, v3, v4);
      }
      // Front face wall
      if (h > h_front) {
        const v1 = [wx, wy, h];
        const v2 = [wx, wy, h_front];
        const v3 = [wx + scaleX, wy, h_front];
        const v4 = [wx + scaleX, wy, h];
        addQuad(v1, v2, v3, v4);
      }
      // Back face wall
      if (h > h_back) {
        const v1 = [wx, wy + scaleY, h_back];
        const v2 = [wx, wy + scaleY, h];
        const v3 = [wx + scaleX, wy + scaleY, h];
        const v4 = [wx + scaleX, wy + scaleY, h_back];
        addQuad(v1, v2, v3, v4);
      }
    }
  }

  stl += 'endsolid scaffold\n';

  const blob = new Blob([stl], { type: 'model/stl' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}