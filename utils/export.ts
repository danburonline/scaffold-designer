

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

  const MASK_THRESHOLD = 8;
  const EPS = 1e-8;

  let stl = 'solid scaffold\n';

  const heights: number[][] = Array.from({ length: canvasWidth }, () => Array(canvasHeight).fill(0));
  const occupied: boolean[][] = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(false));

  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4;
      const gray = data[i];
      const h = gray <= MASK_THRESHOLD ? 0 : (gray / 255) * thickness;
      const clamped = h > EPS ? h : 0;
      heights[x][y] = clamped;
      occupied[y][x] = clamped > 0;
    }
  }

  const vertexAt = (ix: number, iy: number, z: number): [number, number, number] => {
    const wx = ix * scaleX;
    const wy = (canvasHeight - iy) * scaleY;
    return [wx, wy, z];
  };

  const normalOf = (v1: number[], v2: number[], v3: number[]): [number, number, number] => {
    const ux = v2[0] - v1[0];
    const uy = v2[1] - v1[1];
    const uz = v2[2] - v1[2];
    const vx = v3[0] - v1[0];
    const vy = v3[1] - v1[1];
    const vz = v3[2] - v1[2];
    return [
      uy * vz - uz * vy,
      uz * vx - ux * vz,
      ux * vy - uy * vx,
    ];
  };

  const addTriangle = (v1: number[], v2: number[], v3: number[]) => {
    const [nxRaw, nyRaw, nzRaw] = normalOf(v1, v2, v3);
    const len = Math.hypot(nxRaw, nyRaw, nzRaw);
    if (len <= EPS) return;

    const nx = nxRaw / len;
    const ny = nyRaw / len;
    const nz = nzRaw / len;

    stl += `facet normal ${nx} ${ny} ${nz}\n`;
    stl += '  outer loop\n';
    stl += `    vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`;
    stl += `    vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`;
    stl += `    vertex ${v3[0]} ${v3[1]} ${v3[2]}\n`;
    stl += '  endloop\n';
    stl += 'endfacet\n';
  };

  const addQuadOriented = (
    v1: number[],
    v2: number[],
    v3: number[],
    v4: number[],
    targetNormal: [number, number, number],
  ) => {
    const [nx, ny, nz] = normalOf(v1, v2, v3);
    const dot = nx * targetNormal[0] + ny * targetNormal[1] + nz * targetNormal[2];

    if (dot >= 0) {
      addTriangle(v1, v2, v3);
      addTriangle(v1, v3, v4);
    } else {
      addTriangle(v1, v4, v3);
      addTriangle(v1, v3, v2);
    }
  };

  const usedBottom: boolean[][] = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(false));

  for (let y0 = 0; y0 < canvasHeight; y0++) {
    for (let x0 = 0; x0 < canvasWidth; x0++) {
      if (!occupied[y0][x0] || usedBottom[y0][x0]) continue;

      let w = 1;
      while (x0 + w < canvasWidth && occupied[y0][x0 + w] && !usedBottom[y0][x0 + w]) w++;

      let h = 1;
      while (y0 + h < canvasHeight) {
        let canExtend = true;
        for (let x = x0; x < x0 + w; x++) {
          if (!occupied[y0 + h][x] || usedBottom[y0 + h][x]) {
            canExtend = false;
            break;
          }
        }
        if (!canExtend) break;
        h++;
      }

      for (let yy = y0; yy < y0 + h; yy++) {
        for (let xx = x0; xx < x0 + w; xx++) {
          usedBottom[yy][xx] = true;
        }
      }

      const b1 = vertexAt(x0, y0, 0);
      const b2 = vertexAt(x0 + w, y0, 0);
      const b3 = vertexAt(x0 + w, y0 + h, 0);
      const b4 = vertexAt(x0, y0 + h, 0);
      addQuadOriented(b1, b2, b3, b4, [0, 0, -1]);
    }
  }

  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const h = heights[x][y];
      if (h <= EPS) continue;

      const t1 = vertexAt(x, y, h);
      const t2 = vertexAt(x + 1, y, h);
      const t3 = vertexAt(x + 1, y + 1, h);
      const t4 = vertexAt(x, y + 1, h);
      addQuadOriented(t1, t2, t3, t4, [0, 0, 1]);

      const hLeft = x > 0 ? heights[x - 1][y] : 0;
      const hRight = x < canvasWidth - 1 ? heights[x + 1][y] : 0;
      const hFront = y > 0 ? heights[x][y - 1] : 0;
      const hBack = y < canvasHeight - 1 ? heights[x][y + 1] : 0;

      if (h - hLeft > EPS) {
        const z0 = hLeft;
        const z1 = h;
        const v1 = vertexAt(x, y, z0);
        const v2 = vertexAt(x, y, z1);
        const v3 = vertexAt(x, y + 1, z1);
        const v4 = vertexAt(x, y + 1, z0);
        addQuadOriented(v1, v2, v3, v4, [-1, 0, 0]);
      }

      if (h - hRight > EPS) {
        const z0 = hRight;
        const z1 = h;
        const v1 = vertexAt(x + 1, y, z0);
        const v2 = vertexAt(x + 1, y + 1, z0);
        const v3 = vertexAt(x + 1, y + 1, z1);
        const v4 = vertexAt(x + 1, y, z1);
        addQuadOriented(v1, v2, v3, v4, [1, 0, 0]);
      }

      if (h - hFront > EPS) {
        const z0 = hFront;
        const z1 = h;
        const v1 = vertexAt(x, y, z0);
        const v2 = vertexAt(x + 1, y, z0);
        const v3 = vertexAt(x + 1, y, z1);
        const v4 = vertexAt(x, y, z1);
        addQuadOriented(v1, v2, v3, v4, [0, 1, 0]);
      }

      if (h - hBack > EPS) {
        const z0 = hBack;
        const z1 = h;
        const v1 = vertexAt(x, y + 1, z0);
        const v2 = vertexAt(x, y + 1, z1);
        const v3 = vertexAt(x + 1, y + 1, z1);
        const v4 = vertexAt(x + 1, y + 1, z0);
        addQuadOriented(v1, v2, v3, v4, [0, -1, 0]);
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