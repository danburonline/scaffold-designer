export type TemplateId = 'serpentine-mesh' | 'aligned-fibers' | 'wavy-channels' | 'radial-spokes' | 'porous-network' | 'grid-gradient' | 'concentric-rings' | 'micropillar-array' | 'crosshatch-grid' | 'tunnels' | 'lamellar' | 'dendritic' | 'honeycomb' | 'equiaxed' | 'cellular' | 'sinusoidal-fibers' | 'vortex' | 'maze' | 'scherk-tower' | 't-junction';
export type TransformId = 'none' | 'twist' | 'pinch' | 'ripple';
export type HeightModulationType = 'none' | 'gradient' | 'perlin' | 'wave';

export interface ScaffoldParams {
  id: string; // Unique ID for saved designs
  name: string;
  templateId: TemplateId;
  transformId: TransformId;
  
  // Geometric params specific to templates
  fiberSpacing: number;
  channelWidth: number;
  waveAmplitude: number;
  waveFrequency: number;
  spokeCount: number;
  poreSize: number;
  poreSizeVariance: number;
  porosity: number;
  gradientStart: number;
  gradientEnd: number;
  ringSpacing: number;
  ringWidth: number;
  pillarDiameter: number;
  pillarSpacing: number;
  wallThickness: number;
  lamellaeWidth: number;
  branchAngle: number;
  branchLengthFactor: number;
  dendriteIterations: number;
  branchThickness: number;
  hexagonSize: number;
  cellDensity: number;
  vortexStrength: number;
  spiralDensity: number;
  mazePathWidth: number;
  scherkFrequency: number;
  junctionSeparation: number; // For t-junction
  junctionHeight: number; // For t-junction
  tunnelWidth: number; // For t-junction
  serpentinePathWidth: number;
  serpentineArcRadius: number;
  serpentineConnectorLength: number;
  serpentineRowSpacing: number;

  // Diffeomorphic transform params
  transformStrength: number;
  
  // Height Modulation
  heightModulationType: HeightModulationType;
  heightModulationAmplitude: number;
  heightModulationFrequency: number;
  heightModulationGradientAngle: number;

  // General scaffold params
  thickness: number; // in µm
  width: number; // in µm
  height: number; // in µm
}

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
}