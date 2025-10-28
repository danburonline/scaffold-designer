
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
 * Generates and triggers a download for an STL file from a canvas element.
 * This is a simplified voxel-based approach. Black pixels are treated as solid material.
 * Note: This can be computationally intensive for large or complex canvases.
 */
export function exportToSTL(canvas: HTMLCanvasElement, params: ScaffoldParams, filename: string) {
  const { thickness, width, height } = params;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const scaleX = width / canvas.width;
  const scaleY = height / canvas.height;
  
  let stl = 'solid scaffold\n';

  const addTriangle = (v1: number[], v2: number[], v3: number[]) => {
    // Normal can be calculated, but for cubes it's axis-aligned. For simplicity, we calculate it here.
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
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      // Check if the pixel is dark (part of the scaffold)
      // Using a threshold for R, G, B values (e.g., < 128)
      if (data[i] < 128 && data[i+1] < 128 && data[i+2] < 128) {
        const wx = x * scaleX;
        const wy = (canvas.height - 1 - y) * scaleY; // Invert Y for typical 3D coordinate systems

        const p1 = [wx, wy, 0];
        const p2 = [wx + scaleX, wy, 0];
        const p3 = [wx + scaleX, wy + scaleY, 0];
        const p4 = [wx, wy + scaleY, 0];
        const p5 = [wx, wy, thickness];
        const p6 = [wx + scaleX, wy, thickness];
        const p7 = [wx + scaleX, wy + scaleY, thickness];
        const p8 = [wx, wy + scaleY, thickness];
        
        // Bottom face
        addQuad(p4, p3, p2, p1);
        // Top face
        addQuad(p5, p6, p7, p8);
        // Front face
        addQuad(p1, p2, p6, p5);
        // Back face
        addQuad(p3, p4, p8, p7);
        // Left face
        addQuad(p4, p1, p5, p8);
        // Right face
        addQuad(p2, p3, p7, p6);
      }
    }
  }

  stl += 'endsolid scaffold\n';

  const blob = new Blob([stl], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
