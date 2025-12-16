
import { ScaffoldParams, TransformId } from '../types';

// Simple Perlin Noise implementation
class Perlin {
  p: number[];
  constructor() {
    this.p = new Array(512);
    const permutation = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    for (let i=0; i < 256 ; i++) this.p[256+i] = this.p[i] = permutation[i];
  }
  fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t: number, a: number, b: number) { return a + t * (b - a); }
  grad(hash: number, x: number, y: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  noise(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const p = this.p;
    const A = p[X] + Y, B = p[X + 1] + Y;
    return this.lerp(v,
        this.lerp(u, this.grad(p[A], x, y), this.grad(p[B], x - 1, y)),
        this.lerp(u, this.grad(p[A + 1], x, y - 1), this.grad(p[B + 1], x - 1, y - 1))
    );
  }
}
const perlin = new Perlin();


// Helper function to apply diffeomorphic transformations
function applyTransform(x: number, y: number, params: ScaffoldParams, centerX: number, centerY: number): [number, number] {
  const { transformId, transformStrength } = params;
  let dx = x - centerX;
  let dy = y - centerY;
  
  switch (transformId) {
    case 'twist': {
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const twistAngle = transformStrength * (r / centerX) * Math.PI;
      return [
        centerX + r * Math.cos(angle + twistAngle),
        centerY + r * Math.sin(angle + twistAngle)
      ];
    }
    case 'pinch': {
      const r = Math.sqrt(dx * dx + dy * dy);
      const pinchFactor = 1 - transformStrength * Math.exp(-0.0001 * r * r);
      return [
        centerX + dx * pinchFactor,
        centerY + dy * pinchFactor
      ];
    }
    case 'ripple': {
        const freq = 5;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const amount = transformStrength * 20 * Math.sin(dist / (20 * (1.1 - transformStrength)));
        return [
            x + (dx/dist) * amount,
            y + (dy/dist) * amount
        ];
    }
    case 'none':
    default:
      return [x, y];
  }
}

// Helpers for Multi-Material Rendering
interface RenderContext {
    materialIndex: number;
    materialCount: number;
}

function shouldRender(index: number, ctx: RenderContext): boolean {
    return (index % ctx.materialCount) === ctx.materialIndex;
}

function drawSerpentineMesh(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, serpentinePathWidth, serpentineArcRadius, serpentineConnectorLength, serpentineRowSpacing } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const R = serpentineArcRadius * (canvas.width / width);
    const L = serpentineConnectorLength * (canvas.width / width);
    const S = serpentineRowSpacing * (canvas.width / width);

    if (R <= 0.1) return; 

    ctx.lineWidth = serpentinePathWidth * (canvas.width / width);
    
    const period = 2 * R + L + 2 * R + L;

    const drawSegment = (p1: [number, number], p2: [number, number]) => {
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = p1[0] * (1 - t) + p2[0] * t;
            const y = p1[1] * (1 - t) + p2[1] * t;
            const [tx, ty] = applyTransform(x, y, params, centerX, centerY);
            ctx.lineTo(tx, ty);
        }
    };

    const drawArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
        const segments = 12;
        const angleStep = (endAngle - startAngle) / segments;
        for (let i = 1; i <= segments; i++) {
            const angle = startAngle + i * angleStep;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const [tx, ty] = applyTransform(x, y, params, centerX, centerY);
            ctx.lineTo(tx, ty);
        }
    };

    let rowCount = 0;
    for (let j = -3; j * S < canvas.height + 3 * S; j++) {
        // Distribute rows across materials
        if (!shouldRender(Math.abs(j), rCtx)) continue;

        const y = j * S;
        const xOffset = (j % 2 !== 0) ? period / 2 : 0;
        
        ctx.beginPath();
        
        let currentX = -period + xOffset;
        while(currentX > 0) currentX -= period;

        const [startX, startY] = applyTransform(currentX, y, params, centerX, centerY);
        ctx.moveTo(startX, startY);

        while (currentX < canvas.width + period) {
            let nextX: number;
            nextX = currentX + L;
            drawSegment([currentX, y], [nextX, y]);
            currentX = nextX;
            drawArc(currentX + R, y, R, Math.PI, 2 * Math.PI);
            currentX += 2 * R;
            nextX = currentX + L;
            drawSegment([currentX, y], [nextX, y]);
            currentX = nextX;
            drawArc(currentX + R, y, R, Math.PI, 0);
            currentX += 2 * R;
        }
        ctx.stroke();
    }
}


// Drawing functions for each template
function drawAlignedFibers(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, fiberSpacing } = params;
    const canvas = ctx.canvas;
    
    let index = 0;
    for (let x = 0; x < canvas.width; x += fiberSpacing * (canvas.width / width)) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            let start = applyTransform(x, 0, params, canvas.width / 2, canvas.height / 2);
            ctx.moveTo(start[0], start[1]);
            for (let y = 1; y <= canvas.height; y++) {
                let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                ctx.lineTo(tx, ty);
            }
            ctx.stroke();
        }
    }
}

function drawWavyChannels(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, fiberSpacing, waveAmplitude, waveFrequency, channelWidth } = params;
    const canvas = ctx.canvas;
    ctx.lineWidth = channelWidth * (canvas.width / width);

    let index = 0;
    for (let y = 0; y < canvas.height + fiberSpacing; y += fiberSpacing * (canvas.height/height)) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            let startX = waveAmplitude * Math.sin(0);
            let [tx, ty] = applyTransform(startX, y, params, canvas.width/2, canvas.height/2);
            ctx.moveTo(tx, ty);
            for(let x = 1; x <= canvas.width; x++){
                let waveX = x + waveAmplitude * Math.sin(x * waveFrequency);
                let [tx2, ty2] = applyTransform(waveX, y + x/canvas.width * (fiberSpacing/2), params, canvas.width/2, canvas.height/2);
                ctx.lineTo(tx2, ty2);
            }
            ctx.stroke();
        }
    }
}

function drawRadialSpokes(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, spokeCount, channelWidth } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.lineWidth = channelWidth * (canvas.width/width);

    for (let i = 0; i < spokeCount; i++) {
        if (shouldRender(i, rCtx)) {
            const angle = (i / spokeCount) * 2 * Math.PI;
            ctx.beginPath();
            let start = applyTransform(centerX, centerY, params, centerX, centerY);
            ctx.moveTo(start[0], start[1]);
            const endX = centerX + centerX * Math.cos(angle);
            const endY = centerY + centerY * Math.sin(angle);
            let end = applyTransform(endX, endY, params, centerX, centerY);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();
        }
    }
}

function drawPorousNetwork(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, porosity, poreSize } = params;
    const canvas = ctx.canvas;
    const numPoints = (1 - porosity) * 5000;
    const radius = poreSize / 2 * (canvas.width / width);

    for(let i = 0; i < numPoints; i++) {
        if (shouldRender(i, rCtx)) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.beginPath();
            let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawGridGradient(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, gradientStart, gradientEnd } = params;
    const canvas = ctx.canvas;
    const cols = 15;
    const cellWidth = canvas.width / cols;
    
    let index = 0;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
            if (shouldRender(index++, rCtx)) {
                const x = (i + 0.5) * cellWidth;
                const y = (j + 0.5) * cellWidth;
                const t = i / (cols - 1); 
                const currentPoreSize = gradientStart + t * (gradientEnd - gradientStart);
                const radius = currentPoreSize / 2 * (canvas.width / width);
                
                ctx.beginPath();
                let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                ctx.arc(tx, ty, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawConcentricRings(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, ringSpacing, ringWidth } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.lineWidth = ringWidth * (canvas.width / width);
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    let index = 0;
    for (let r = ringSpacing; r < maxRadius; r += ringSpacing) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            for (let angle = 0; angle <= 2 * Math.PI; angle += Math.PI / 36) {
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                const [tx, ty] = applyTransform(x, y, params, centerX, centerY);
                if (angle === 0) {
                    ctx.moveTo(tx, ty);
                } else {
                    ctx.lineTo(tx, ty);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function drawMicropillarArray(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, pillarDiameter, pillarSpacing } = params;
    const canvas = ctx.canvas;
    const radius = (pillarDiameter / 2) * (canvas.width / width);
    const xSpacing = pillarSpacing * (canvas.width / width);
    const ySpacing = pillarSpacing * (canvas.height / height);

    let index = 0;
    for (let y = ySpacing / 2; y < canvas.height; y += ySpacing) {
        for (let x = xSpacing / 2; x < canvas.width; x += xSpacing) {
            if (shouldRender(index++, rCtx)) {
                ctx.beginPath();
                let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                ctx.arc(tx, ty, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawCrosshatchGrid(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, fiberSpacing } = params;
    const canvas = ctx.canvas;

    let index = 0;
    // Vertical lines
    for (let x = 0; x < canvas.width; x += fiberSpacing * (canvas.width / width)) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            let start = applyTransform(x, 0, params, canvas.width / 2, canvas.height / 2);
            ctx.moveTo(start[0], start[1]);
            for (let y = 1; y <= canvas.height; y++) {
                let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                ctx.lineTo(tx, ty);
            }
            ctx.stroke();
        }
    }
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += fiberSpacing * (canvas.height / height)) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            let start = applyTransform(0, y, params, canvas.width / 2, canvas.height / 2);
            ctx.moveTo(start[0], start[1]);
            for (let x = 1; x <= canvas.width; x++) {
                let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                ctx.lineTo(tx, ty);
            }
            ctx.stroke();
        }
    }
}

function drawTunnels(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, channelWidth, wallThickness } = params;
    const canvas = ctx.canvas;
    const totalPeriod = channelWidth + wallThickness;
    const scaledChannelWidth = channelWidth * (canvas.width / width);
    const scaledPeriod = totalPeriod * (canvas.width / width);

    let index = 0;
    for (let x = 0; x < canvas.width; x += scaledPeriod) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            const path = new Path2D();
            let start = applyTransform(x,0, params, canvas.width/2, canvas.height/2);
            path.moveTo(start[0], start[1]);
            for (let y = 1; y <= canvas.height; y++) {
                const [tx, ty] = applyTransform(x, y, params, canvas.width / 2, canvas.height / 2);
                path.lineTo(tx, ty);
            }
            for (let y = canvas.height; y >= 0; y--) {
                const [tx, ty] = applyTransform(x + scaledChannelWidth, y, params, canvas.width / 2, canvas.height / 2);
                path.lineTo(tx, ty);
            }
            path.closePath();
            ctx.fill(path);
        }
    }
}

function drawLamellar(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, fiberSpacing, lamellaeWidth } = params;
    const canvas = ctx.canvas;
    const scaledSpacing = fiberSpacing * (canvas.width / width);
    const scaledWidth = lamellaeWidth * (canvas.width / width);

    let index = 0;
    for (let x = 0; x < canvas.width; x += scaledSpacing) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            const points = [
                applyTransform(x, 0, params, canvas.width/2, canvas.height/2),
                applyTransform(x + scaledWidth, 0, params, canvas.width/2, canvas.height/2),
                applyTransform(x + scaledWidth, canvas.height, params, canvas.width/2, canvas.height/2),
                applyTransform(x, canvas.height, params, canvas.width/2, canvas.height/2),
            ];
            ctx.moveTo(points[0][0], points[0][1]);
            for(let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

function drawDendritic(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, branchAngle, branchLengthFactor, dendriteIterations, branchThickness } = params;
    const canvas = ctx.canvas;
    const baseThickness = branchThickness * (canvas.width / width);
    
    // Pass branchID to determine material ownership
    const drawBranch = (x: number, y: number, angle: number, length: number, iteration: number, thickness: number, branchID: number) => {
        if (iteration === 0) return;

        // Only draw if this branch belongs to current material
        if (shouldRender(branchID, rCtx)) {
            const endX = x + length * Math.cos(angle * Math.PI / 180);
            const endY = y + length * Math.sin(angle * Math.PI / 180);

            ctx.beginPath();
            const [startX_t, startY_t] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            const [endX_t, endY_t] = applyTransform(endX, endY, params, canvas.width/2, canvas.height/2);
            ctx.moveTo(startX_t, startY_t);
            ctx.lineTo(endX_t, endY_t);
            ctx.lineWidth = Math.max(1, thickness);
            ctx.stroke();

            const newThickness = thickness * branchLengthFactor;
            // Generate deterministic IDs for children
            drawBranch(endX, endY, angle - branchAngle, length * branchLengthFactor, iteration - 1, newThickness, branchID * 2);
            drawBranch(endX, endY, angle + branchAngle, length * branchLengthFactor, iteration - 1, newThickness, branchID * 2 + 1);
        } else {
             // If this branch isn't drawn, we still need to calculate coordinates for children
             const endX = x + length * Math.cos(angle * Math.PI / 180);
             const endY = y + length * Math.sin(angle * Math.PI / 180);
             const newThickness = thickness * branchLengthFactor;
             drawBranch(endX, endY, angle - branchAngle, length * branchLengthFactor, iteration - 1, newThickness, branchID * 2);
             drawBranch(endX, endY, angle + branchAngle, length * branchLengthFactor, iteration - 1, newThickness, branchID * 2 + 1);
        }
    }

    const startLength = canvas.height / 4;
    // Start with ID 1 so multiplication works
    drawBranch(canvas.width / 2, canvas.height, -90, startLength, dendriteIterations, baseThickness, 1);
}


function drawHoneycomb(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, hexagonSize } = params;
    const canvas = ctx.canvas;
    const size = hexagonSize * (canvas.width / width);
    const hexWidth = Math.sqrt(3) * size;
    const hexHeight = 2 * size;

    let index = 0;
    for (let y = 0, row = 0; y < canvas.height + size; y += hexHeight * 3/4, row++) {
        for (let x = 0, col = 0; x < canvas.width + hexWidth; x += hexWidth, col++) {
            if (shouldRender(index++, rCtx)) {
                const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
                const centerX = x + offsetX;
                const centerY = y;

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + Math.PI / 6;
                    const pointX = centerX + size * Math.cos(angle);
                    const pointY = centerY + size * Math.sin(angle);
                    const [tx, ty] = applyTransform(pointX, pointY, params, canvas.width/2, canvas.height/2);
                    if (i === 0) {
                        ctx.moveTo(tx, ty);
                    } else {
                        ctx.lineTo(tx, ty);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
}

function drawEquiaxed(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, porosity, poreSize, poreSizeVariance } = params;
    const canvas = ctx.canvas;
    const numPoints = (1 - porosity) * 3000;
    
    for(let i = 0; i < numPoints; i++) {
        if (shouldRender(i, rCtx)) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const variance = (Math.random() - 0.5) * 2 * poreSizeVariance; 
            const currentPoreSize = poreSize * (1 + variance);
            const radius = currentPoreSize / 2 * (canvas.width / width);

            if (radius <= 0) continue;

            ctx.beginPath();
            let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawCellular(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { cellDensity } = params;
    const canvas = ctx.canvas;
    const numPoints = cellDensity * canvas.width * canvas.height;
    
    for(let i = 0; i < numPoints; i++) {
        if (shouldRender(i, rCtx)) {
            const centerX = Math.random() * canvas.width;
            const centerY = Math.random() * canvas.height;
            const radius = (Math.random() * 0.8 + 0.2) * Math.sqrt(1 / cellDensity) / 2;
            
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI/8) {
                const r = radius * (0.8 + Math.random() * 0.4);
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                const [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                if (angle === 0) {
                    ctx.moveTo(tx, ty);
                } else {
                    ctx.lineTo(tx, ty);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

function drawSinusoidalFibers(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, fiberSpacing, waveAmplitude, waveFrequency } = params;
    const canvas = ctx.canvas;

    let index = 0;
    for (let y = 0; y < canvas.height + fiberSpacing; y += fiberSpacing * (canvas.height/height)) {
        if (shouldRender(index++, rCtx)) {
            ctx.beginPath();
            let startX = waveAmplitude * Math.sin(0);
            let [tx, ty] = applyTransform(startX, y, params, canvas.width/2, canvas.height/2);
            ctx.moveTo(tx, ty);
            for(let x = 1; x <= canvas.width; x++){
                let waveX = x + waveAmplitude * (canvas.width / width) * Math.sin(y * 0.1 + x * waveFrequency);
                let [tx2, ty2] = applyTransform(waveX, y, params, canvas.width/2, canvas.height/2);
                ctx.lineTo(tx2, ty2);
            }
            ctx.stroke();
        }
    }
}

function drawVortex(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { vortexStrength, spiralDensity } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // For vortex, we can render multi-arms if multiple materials are selected
    // Offset angle based on material index
    const angleOffset = (rCtx.materialIndex / rCtx.materialCount) * 2 * Math.PI;

    ctx.beginPath();
    for (let i = 0; i < 360 * spiralDensity; i++) {
        const angle = 0.1 * i + angleOffset;
        const x = centerX + (vortexStrength * (0.1*i)) * Math.cos(angle);
        const y = centerY + (vortexStrength * (0.1*i)) * Math.sin(angle);
        
        const [tx, ty] = applyTransform(x, y, params, centerX, centerY);
        if (i === 0) {
             ctx.moveTo(tx, ty);
        } else {
             ctx.lineTo(tx, ty);
        }
    }
    ctx.stroke();
}

function drawMaze(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, mazePathWidth } = params;
    const canvas = ctx.canvas;
    const scaledPathWidth = mazePathWidth * (canvas.width / width);
    const cellSize = scaledPathWidth * 2;
    ctx.lineWidth = scaledPathWidth;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    
    let index = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (shouldRender(index++, rCtx)) {
                const x = c * cellSize + cellSize / 2;
                const y = r * cellSize + cellSize / 2;
                
                ctx.beginPath();
                if (Math.random() > 0.5) { // Horizontal wall
                    const start = applyTransform(x - cellSize/2, y, params, canvas.width / 2, canvas.height / 2);
                    const end = applyTransform(x + cellSize/2, y, params, canvas.width / 2, canvas.height / 2);
                    ctx.moveTo(start[0], start[1]);
                    ctx.lineTo(end[0], end[1]);
                } else { // Vertical wall
                    const start = applyTransform(x, y - cellSize/2, params, canvas.width / 2, canvas.height / 2);
                    const end = applyTransform(x, y + cellSize/2, params, canvas.width / 2, canvas.height / 2);
                    ctx.moveTo(start[0], start[1]);
                    ctx.lineTo(end[0], end[1]);
                }
                ctx.stroke();
            }
        }
    }
}

function drawScherkTower(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { scherkFrequency } = params;
    const canvas = ctx.canvas;
    
    // Pixel-based approach is slow for loop, so we iterate once and check material
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    // We assume the caller (drawScaffold) has set fillStyle (which we can't easily use with putImageData)
    // So we just draw white here, and the caller handles compositing/color logic via fillRect if needed.
    // However, since ScherkTower was implemented as fillRect 1x1, let's keep it but optimized.
    
    // Fallback to rect approach for simplicity with transforms, but use larger steps if needed
    for (let y = 0; y < canvas.height; y+=2) {
        for (let x = 0; x < canvas.width; x+=2) {
            const normX = (x - canvas.width / 2) / (canvas.width / 2);
            const normY = (y - canvas.height / 2) / (canvas.height / 2);
            
            // Spatial hashing for material assignment
            const hash = Math.floor(x/10) + Math.floor(y/10);
            
            if (shouldRender(hash, rCtx)) {
                if (Math.cos(scherkFrequency * normX) + Math.cos(scherkFrequency * normY) > 0) {
                     const [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                     ctx.fillRect(tx, ty, 2, 2);
                }
            }
        }
    }
}

function drawTJunction(ctx: CanvasRenderingContext2D, params: ScaffoldParams, rCtx: RenderContext) {
    const { width, height, tunnelWidth, junctionSeparation, junctionHeight } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const sTunnelW = tunnelWidth * (canvas.width / width);
    const sJunctionSep = junctionSeparation * (canvas.width / width);
    const sJunctionH = junctionHeight * (canvas.height / height);

    const chamberY = centerY - sJunctionH / 2;
    // Left chamber
    const leftChamberX = centerX - sJunctionSep / 2;
    if (shouldRender(0, rCtx)) ctx.fillRect(leftChamberX, chamberY, sTunnelW, sJunctionH);
    // Right chamber
    const rightChamberX = centerX + sJunctionSep / 2 - sTunnelW;
    if (shouldRender(1, rCtx)) ctx.fillRect(rightChamberX, chamberY, sTunnelW, sJunctionH);
    // Connecting tunnel
    const tunnelY = centerY - sTunnelW / 2;
    if (shouldRender(2, rCtx)) ctx.fillRect(leftChamberX, tunnelY, sJunctionSep, sTunnelW);
}


function drawScaffoldMaterialLayer(ctx: CanvasRenderingContext2D, params: ScaffoldParams, materialIndex: number) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // For mask generation, we draw white on black
  ctx.fillStyle = '#000000'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff'; 
  ctx.strokeStyle = '#ffffff'; 
  ctx.lineWidth = 2; 
  ctx.lineCap = 'round';
  
  const rCtx: RenderContext = {
      materialIndex,
      materialCount: params.materialCount || 1
  };
  
  switch (params.templateId) {
    case 'serpentine-mesh': drawSerpentineMesh(ctx, params, rCtx); break;
    case 'aligned-fibers': drawAlignedFibers(ctx, params, rCtx); break;
    case 'wavy-channels': drawWavyChannels(ctx, params, rCtx); break;
    case 'radial-spokes': drawRadialSpokes(ctx, params, rCtx); break;
    case 'porous-network': drawPorousNetwork(ctx, params, rCtx); break;
    case 'grid-gradient':
        // Custom background handling for inverted types might be needed, but sticking to additive white-on-black for mask
        drawGridGradient(ctx, params, rCtx);
        break;
    case 'concentric-rings': drawConcentricRings(ctx, params, rCtx); break;
    case 'micropillar-array': drawMicropillarArray(ctx, params, rCtx); break;
    case 'crosshatch-grid': drawCrosshatchGrid(ctx, params, rCtx); break;
    case 'tunnels':
        // Tunnels are inverted in the original code (carved out). 
        // For multi-material, we treat the 'walls' as material.
        // The original code filled background with wall color and carved tunnel.
        // Here we draw walls.
        // Actually, let's keep it simple: draw shapes.
        // The original 'drawTunnels' carved out. We need to invert logic?
        // Let's rely on drawTunnels drawing "something". 
        // The previous implementation used path filling for walls.
        // We will stick to the previous implementation which drew the SOLID parts.
        // Note: The previous implementation filled the whole canvas then carved.
        // To split walls into materials is hard if it's one big block.
        // Let's assume Tunnels are monolithic or just split by X index.
        drawTunnels(ctx, params, rCtx);
        break;
    case 'lamellar': drawLamellar(ctx, params, rCtx); break;
    case 'dendritic': drawDendritic(ctx, params, rCtx); break;
    case 'honeycomb': drawHoneycomb(ctx, params, rCtx); break;
    case 'equiaxed': drawEquiaxed(ctx, params, rCtx); break;
    case 'cellular': drawCellular(ctx, params, rCtx); break;
    case 'sinusoidal-fibers': drawSinusoidalFibers(ctx, params, rCtx); break;
    case 'vortex': drawVortex(ctx, params, rCtx); break;
    case 'maze': drawMaze(ctx, params, rCtx); break;
    case 'scherk-tower': drawScherkTower(ctx, params, rCtx); break;
    case 't-junction': drawTJunction(ctx, params, rCtx); break;
  }
}

// Applies height modulation to a grayscale mask (input) and puts it on outputCtx
function applyHeightMapProcessing(inputCtx: CanvasRenderingContext2D, outputCtx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const canvas = inputCtx.canvas;
    const maskData = inputCtx.getImageData(0, 0, canvas.width, canvas.height);
    const maskPixels = maskData.data;

    const outputImageData = outputCtx.createImageData(canvas.width, canvas.height);
    const outputPixels = outputImageData.data;

    const { heightModulationType, heightModulationAmplitude, heightModulationFrequency, heightModulationGradientAngle } = params;
    const angleRad = heightModulationGradientAngle * Math.PI / 180;
    const gradVec = { x: Math.cos(angleRad), y: Math.sin(angleRad) };
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            
            // If mask is black (0), it's void space.
            if (maskPixels[i] < 50) { 
                outputPixels[i] = 0; outputPixels[i+1] = 0; outputPixels[i+2] = 0; outputPixels[i+3] = 0; // Transparent
                continue;
            }

            let baseHeight = 1.0;
            let modulation = 0;
            const normX = x / canvas.width;
            const normY = y / canvas.height;

            switch(heightModulationType) {
                case 'gradient':
                    let dot = (normX - 0.5) * gradVec.x + (normY - 0.5) * gradVec.y;
                    modulation = (dot + 0.5);
                    break;
                case 'perlin':
                    modulation = (perlin.noise(normX * heightModulationFrequency, normY * heightModulationFrequency) + 1) / 2;
                    break;
                case 'wave':
                    modulation = (Math.sin(normX * heightModulationFrequency * Math.PI * 2) + 1) / 2;
                    break;
                default:
                    modulation = 1.0;
                    break;
            }

            let finalHeight = baseHeight;
            if (heightModulationType !== 'none') {
                finalHeight = Math.max(0, Math.min(1, (1 - heightModulationAmplitude) + heightModulationAmplitude * modulation));
            }
            
            const grayValue = Math.floor(finalHeight * 255);
            outputPixels[i] = grayValue; outputPixels[i+1] = grayValue; outputPixels[i+2] = grayValue; outputPixels[i+3] = 255;
        }
    }
    outputCtx.putImageData(outputImageData, 0, 0);
}

interface DrawOptions {
    preview?: boolean; // If true, draws all materials in color. If false, respects materialIndex.
    materialIndex?: number; // If set (and not preview), draws only this material in grayscale.
}

const MATERIAL_COLORS = [
    [248, 113, 113], // Red 400
    [96, 165, 250],  // Blue 400
    [52, 211, 153],  // Green 400
    [251, 191, 36],  // Amber 400
    [167, 139, 250], // Purple 400
    [232, 121, 249], // Fuchsia 400
];

export function drawScaffold(ctx: CanvasRenderingContext2D, params: ScaffoldParams, options: DrawOptions = {}) {
    const canvas = ctx.canvas;
    const { materialCount = 1 } = params;

    // Helper canvas for mask generation
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return;

    // Helper canvas for height map result
    const hmCanvas = document.createElement('canvas');
    hmCanvas.width = canvas.width;
    hmCanvas.height = canvas.height;
    const hmCtx = hmCanvas.getContext('2d', { willReadFrequently: true });
    if (!hmCtx) return;

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill background for preview
    if (options.preview) {
        ctx.fillStyle = '#111827'; // Dark bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Determine loop range
    let startM = 0;
    let endM = materialCount;
    if (options.materialIndex !== undefined && !options.preview) {
        startM = options.materialIndex;
        endM = startM + 1;
    }

    for (let m = startM; m < endM; m++) {
        // 1. Draw the raw shape mask for material m
        drawScaffoldMaterialLayer(maskCtx, params, m);

        // 2. Process height modulation -> puts result on hmCtx
        applyHeightMapProcessing(maskCtx, hmCtx, params);

        // 3. Composite onto main canvas
        if (options.preview) {
            // Tint the grayscale result with the material color
            const hmData = hmCtx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = hmData.data;
            const color = MATERIAL_COLORS[m % MATERIAL_COLORS.length];
            
            // Create a buffer for the colored layer
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = canvas.width;
            layerCanvas.height = canvas.height;
            const layerCtx = layerCanvas.getContext('2d');
            const layerImgData = layerCtx!.createImageData(canvas.width, canvas.height);
            const layerPixels = layerImgData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                const gray = pixels[i]; // R=G=B in grayscale
                const alpha = pixels[i+3];
                if (alpha > 0) {
                    layerPixels[i] = (gray / 255) * color[0];
                    layerPixels[i+1] = (gray / 255) * color[1];
                    layerPixels[i+2] = (gray / 255) * color[2];
                    layerPixels[i+3] = 255; // Full opacity, or use alpha blending?
                }
            }
            layerCtx!.putImageData(layerImgData, 0, 0);

            // Additive blend for previewing multiple materials
            ctx.globalCompositeOperation = 'lighten';
            ctx.drawImage(layerCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            // Export mode: just draw the grayscale height map directly
            ctx.drawImage(hmCanvas, 0, 0);
        }
    }
}
