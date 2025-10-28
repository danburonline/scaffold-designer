import { ScaffoldParams, TransformId } from '../types';

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

// Drawing functions for each template
function drawAlignedFibers(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, fiberSpacing } = params;
    const canvas = ctx.canvas;

    for (let x = 0; x < canvas.width; x += fiberSpacing * (canvas.width / width)) {
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

function drawWavyChannels(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, fiberSpacing, waveAmplitude, waveFrequency, channelWidth } = params;
    const canvas = ctx.canvas;
    ctx.lineWidth = channelWidth * (canvas.width / width);

    for (let y = 0; y < canvas.height + fiberSpacing; y += fiberSpacing * (canvas.height/height)) {
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

function drawRadialSpokes(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, spokeCount, channelWidth } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.lineWidth = channelWidth * (canvas.width/width);

    for (let i = 0; i < spokeCount; i++) {
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

function drawPorousNetwork(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, porosity, poreSize } = params;
    const canvas = ctx.canvas;
    const numPoints = (1 - porosity) * 5000;
    const radius = poreSize / 2 * (canvas.width / width);

    for(let i = 0; i < numPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGridGradient(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, gradientStart, gradientEnd } = params;
    const canvas = ctx.canvas;
    const cols = 15;
    const cellWidth = canvas.width / cols;
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
            const x = (i + 0.5) * cellWidth;
            const y = (j + 0.5) * cellWidth;
            const t = i / (cols - 1); // Gradient along x-axis
            const currentPoreSize = gradientStart + t * (gradientEnd - gradientStart);
            const radius = currentPoreSize / 2 * (canvas.width / width);
            
            ctx.beginPath();
            let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawConcentricRings(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, ringSpacing, ringWidth } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.lineWidth = ringWidth * (canvas.width / width);
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let r = ringSpacing; r < maxRadius; r += ringSpacing) {
        ctx.beginPath();
        // We approximate the transformed circle by transforming many points along its perimeter
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

function drawMicropillarArray(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, pillarDiameter, pillarSpacing } = params;
    const canvas = ctx.canvas;
    const radius = (pillarDiameter / 2) * (canvas.width / width);
    const xSpacing = pillarSpacing * (canvas.width / width);
    const ySpacing = pillarSpacing * (canvas.height / height);

    for (let y = ySpacing / 2; y < canvas.height; y += ySpacing) {
        for (let x = xSpacing / 2; x < canvas.width; x += xSpacing) {
            ctx.beginPath();
            let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawCrosshatchGrid(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, fiberSpacing } = params;
    const canvas = ctx.canvas;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += fiberSpacing * (canvas.width / width)) {
        ctx.beginPath();
        let start = applyTransform(x, 0, params, canvas.width / 2, canvas.height / 2);
        ctx.moveTo(start[0], start[1]);
        for (let y = 1; y <= canvas.height; y++) {
            let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += fiberSpacing * (canvas.height / height)) {
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

function drawTunnels(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, channelWidth, wallThickness } = params;
    const canvas = ctx.canvas;
    const totalPeriod = channelWidth + wallThickness;
    const scaledChannelWidth = channelWidth * (canvas.width / width);
    const scaledPeriod = totalPeriod * (canvas.width / width);

    // Draw solid material background first
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Now carve out the tunnels
    ctx.fillStyle = '#f3f4f6'; // Empty space color

    for (let x = 0; x < canvas.width; x += scaledPeriod) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y++) {
            const [tx, ty] = applyTransform(x, y, params, canvas.width / 2, canvas.height / 2);
            const [tx2, ty2] = applyTransform(x + scaledChannelWidth, y, params, canvas.width / 2, canvas.height / 2);
            if (y === 0) {
                ctx.moveTo(tx, ty);
            } else {
                ctx.lineTo(tx, ty);
            }
            // This is a simplified approach; proper transformation would require a mesh.
            // For now, we draw a transformed quad for each segment.
        }
        // This loop draws the left side of the tunnel, now draw the right and fill
        for (let y = canvas.height; y >= 0; y--) {
            const [tx, ty] = applyTransform(x + scaledChannelWidth, y, params, canvas.width / 2, canvas.height / 2);
            ctx.lineTo(tx, ty);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// --- NEW DRAWING FUNCTIONS ---

function drawLamellar(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, fiberSpacing, lamellaeWidth } = params;
    const canvas = ctx.canvas;
    const scaledSpacing = fiberSpacing * (canvas.width / width);
    const scaledWidth = lamellaeWidth * (canvas.width / width);

    for (let x = 0; x < canvas.width; x += scaledSpacing) {
        ctx.beginPath();
        // Approximate transformed rectangle by a polygon
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

function drawDendritic(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, branchAngle, branchLengthFactor, dendriteIterations, branchThickness } = params;
    const canvas = ctx.canvas;
    const baseThickness = branchThickness * (canvas.width / width);
    
    const drawBranch = (x: number, y: number, angle: number, length: number, iteration: number, thickness: number) => {
        if (iteration === 0) return;

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
        drawBranch(endX, endY, angle - branchAngle, length * branchLengthFactor, iteration - 1, newThickness);
        drawBranch(endX, endY, angle + branchAngle, length * branchLengthFactor, iteration - 1, newThickness);
    }

    const startLength = canvas.height / 4;
    drawBranch(canvas.width / 2, canvas.height, -90, startLength, dendriteIterations, baseThickness);
}


function drawHoneycomb(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, hexagonSize } = params;
    const canvas = ctx.canvas;
    const size = hexagonSize * (canvas.width / width);
    const hexWidth = Math.sqrt(3) * size;
    const hexHeight = 2 * size;

    for (let y = 0, row = 0; y < canvas.height + size; y += hexHeight * 3/4, row++) {
        for (let x = 0, col = 0; x < canvas.width + hexWidth; x += hexWidth, col++) {
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

function drawEquiaxed(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, porosity, poreSize, poreSizeVariance } = params;
    const canvas = ctx.canvas;
    const numPoints = (1 - porosity) * 3000;
    
    for(let i = 0; i < numPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const variance = (Math.random() - 0.5) * 2 * poreSizeVariance; // -1 to 1
        const currentPoreSize = poreSize * (1 + variance);
        const radius = currentPoreSize / 2 * (canvas.width / width);

        if (radius <= 0) continue;

        ctx.beginPath();
        let [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCellular(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { cellDensity } = params;
    const canvas = ctx.canvas;
    const numPoints = cellDensity * canvas.width * canvas.height;

    // Fill with material first
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Carve out cells
    ctx.fillStyle = '#f3f4f6';
    
    for(let i = 0; i < numPoints; i++) {
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

function drawSinusoidalFibers(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, height, fiberSpacing, waveAmplitude, waveFrequency } = params;
    const canvas = ctx.canvas;

    for (let y = 0; y < canvas.height + fiberSpacing; y += fiberSpacing * (canvas.height/height)) {
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

function drawVortex(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { vortexStrength, spiralDensity } = params;
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.beginPath();
    for (let i = 0; i < 360 * spiralDensity; i++) {
        const angle = 0.1 * i;
        const x = centerX + (vortexStrength * angle) * Math.cos(angle);
        const y = centerY + (vortexStrength * angle) * Math.sin(angle);
        
        const [tx, ty] = applyTransform(x, y, params, centerX, centerY);
        if (i === 0) {
             ctx.moveTo(tx, ty);
        } else {
             ctx.lineTo(tx, ty);
        }
    }
    ctx.stroke();
}

function drawMaze(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { width, mazePathWidth } = params;
    const canvas = ctx.canvas;
    const scaledPathWidth = mazePathWidth * (canvas.width / width);
    const cellSize = scaledPathWidth * 2;
    ctx.lineWidth = scaledPathWidth;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
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

function drawScherkTower(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
    const { scherkFrequency } = params;
    const canvas = ctx.canvas;
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const normX = (x - canvas.width / 2) / (canvas.width / 2);
            const normY = (y - canvas.height / 2) / (canvas.height / 2);
            
            // This creates a checkerboard-like pattern based on the Scherk minimal surface equation
            if (Math.cos(scherkFrequency * normX) + Math.cos(scherkFrequency * normY) > 0) {
                 const [tx, ty] = applyTransform(x, y, params, canvas.width/2, canvas.height/2);
                 ctx.fillRect(tx, ty, 1, 1);
            }
        }
    }
}

function drawTJunction(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
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
    ctx.fillRect(leftChamberX, chamberY, sTunnelW, sJunctionH);
    // Right chamber
    const rightChamberX = centerX + sJunctionSep / 2 - sTunnelW;
    ctx.fillRect(rightChamberX, chamberY, sTunnelW, sJunctionH);
    // Connecting tunnel
    const tunnelY = centerY - sTunnelW / 2;
    ctx.fillRect(leftChamberX, tunnelY, sJunctionSep, sTunnelW);
}


export function drawScaffold(ctx: CanvasRenderingContext2D, params: ScaffoldParams) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Background
  ctx.fillStyle = '#f3f4f6'; // gray-200
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Foreground (scaffold material)
  ctx.fillStyle = '#1f2937'; // gray-800
  ctx.strokeStyle = '#1f2937'; // gray-800
  ctx.lineWidth = 2; // Default line width
  
  switch (params.templateId) {
    case 'aligned-fibers':
      drawAlignedFibers(ctx, params);
      break;
    case 'wavy-channels':
      drawWavyChannels(ctx, params);
      break;
    case 'radial-spokes':
      drawRadialSpokes(ctx, params);
      break;
    case 'porous-network':
      drawPorousNetwork(ctx, params);
      break;
    case 'grid-gradient':
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1f2937';
        // We draw circles of material and leave the rest empty
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f3f4f6'; // Pores are empty space
        drawGridGradient(ctx, params);
        break;
    case 'concentric-rings':
        drawConcentricRings(ctx, params);
        break;
    case 'micropillar-array':
        drawMicropillarArray(ctx, params);
        break;
    case 'crosshatch-grid':
        drawCrosshatchGrid(ctx, params);
        break;
    case 'tunnels':
        drawTunnels(ctx, params);
        break;
    case 'lamellar':
        drawLamellar(ctx, params);
        break;
    case 'dendritic':
        drawDendritic(ctx, params);
        break;
    case 'honeycomb':
        drawHoneycomb(ctx, params);
        break;
    case 'equiaxed':
        drawEquiaxed(ctx, params);
        break;
    case 'cellular':
        drawCellular(ctx, params);
        break;
    case 'sinusoidal-fibers':
        drawSinusoidalFibers(ctx, params);
        break;
    case 'vortex':
        drawVortex(ctx, params);
        break;
    case 'maze':
        drawMaze(ctx, params);
        break;
    case 'scherk-tower':
        drawScherkTower(ctx, params);
        break;
    case 't-junction':
        drawTJunction(ctx, params);
        break;
  }
}