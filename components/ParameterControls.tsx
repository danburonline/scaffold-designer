import React, { useMemo } from 'react';
import { ScaffoldParams, TransformId, TemplateId, HeightModulationType } from '../types';
import { DEFAULT_PARAMS } from '../constants';

interface ParameterControlsProps {
  params: ScaffoldParams;
  setParams: React.Dispatch<React.SetStateAction<ScaffoldParams>>;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; help: string; }> = 
({ label, value, min, max, step, unit, onChange, help }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300" title={help}>
            {label}
        </label>
        <div className="flex items-center space-x-2">
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            <span className="text-sm text-gray-300 font-mono w-24 text-right">{value.toFixed(label.includes('Frequency') || label.includes('Porosity') || label.includes('Factor') || label.includes('Density') || label.includes('Strength') || label.includes('Amplitude') ? 3 : 0)} {unit}</span>
        </div>
    </div>
);

export const ParameterControls: React.FC<ParameterControlsProps> = ({ params, setParams }) => {
  const handleParamChange = (field: keyof ScaffoldParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(p => ({ ...p, [field]: parseFloat(e.target.value) }));
  };
  
  const handleSelectChange = (field: keyof ScaffoldParams) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams(p => ({ ...p, [field]: e.target.value as any }));
  };

  const handleRandomize = () => {
    const randomizedParams = { ...params };

    const randomizeField = (field: keyof ScaffoldParams, min: number, max: number, isFloat = false) => {
        const randomValue = min + Math.random() * (max - min);
        (randomizedParams as any)[field] = isFloat ? randomValue : Math.round(randomValue);
    };

    switch(params.templateId) {
        case 'aligned-fibers':
            randomizeField('fiberSpacing', 10, 80);
            break;
        case 'wavy-channels':
            randomizeField('fiberSpacing', 30, 100);
            randomizeField('channelWidth', 10, 50);
            randomizeField('waveAmplitude', 10, 80);
            randomizeField('waveFrequency', 0.01, 0.2, true);
            break;
        case 'concentric-rings':
            randomizeField('ringSpacing', 20, 80);
            randomizeField('ringWidth', 5, 30);
            break;
        case 'micropillar-array':
            randomizeField('pillarDiameter', 10, 50);
            randomizeField('pillarSpacing', 20, 100);
            break;
        case 'lamellar':
            randomizeField('fiberSpacing', 20, 100);
            randomizeField('lamellaeWidth', 10, 50);
            break;
        case 'dendritic':
            randomizeField('branchAngle', 15, 75);
            randomizeField('branchLengthFactor', 0.6, 0.9, true);
            randomizeField('dendriteIterations', 3, 6);
            randomizeField('branchThickness', 2, 8);
            break;
        case 'honeycomb':
            randomizeField('hexagonSize', 15, 60);
            break;
        case 'equiaxed':
            randomizeField('poreSize', 20, 80);
            randomizeField('poreSizeVariance', 0.1, 0.9, true);
            randomizeField('porosity', 0.3, 0.7, true);
            break;
        case 'cellular':
            randomizeField('cellDensity', 0.0001, 0.0015, true);
            break;
        case 'sinusoidal-fibers':
            randomizeField('fiberSpacing', 20, 100);
            randomizeField('waveAmplitude', 5, 50);
            randomizeField('waveFrequency', 0.01, 0.2, true);
            break;
        case 'vortex':
            randomizeField('vortexStrength', 2, 15);
            randomizeField('spiralDensity', 1, 8);
            break;
        case 'maze':
            randomizeField('mazePathWidth', 10, 50);
            break;
        case 'scherk-tower':
            randomizeField('scherkFrequency', 2, 12);
            break;
        case 't-junction':
            randomizeField('junctionSeparation', 100, 400);
            randomizeField('junctionHeight', 100, 400);
            randomizeField('tunnelWidth', 10, 80);
            break;
    }

    randomizeField('transformStrength', 0.1, 0.8, true);
    
    const modulationTypes: HeightModulationType[] = ['none', 'gradient', 'perlin', 'wave'];
    randomizedParams.heightModulationType = modulationTypes[Math.floor(Math.random() * modulationTypes.length)];
    randomizeField('heightModulationAmplitude', 0.2, 1.0, true);
    randomizeField('heightModulationFrequency', 2, 20, true);
    randomizeField('heightModulationGradientAngle', 0, 360);

    setParams(randomizedParams);
  };

  const templateControls = useMemo(() => {
    switch (params.templateId) {
      case 'aligned-fibers':
        return <Slider label="Fiber Spacing" value={params.fiberSpacing} min={5} max={100} step={1} unit="µm" onChange={handleParamChange('fiberSpacing')} help="Distance between parallel fibers."/>;
      case 'wavy-channels':
        return <>
          <Slider label="Channel Spacing" value={params.fiberSpacing} min={20} max={150} step={1} unit="µm" onChange={handleParamChange('fiberSpacing')} help="Overall distance between channels."/>
          <Slider label="Channel Width" value={params.channelWidth} min={5} max={80} step={1} unit="µm" onChange={handleParamChange('channelWidth')} help="Width of the guidance channels."/>
          <Slider label="Amplitude" value={params.waveAmplitude} min={0} max={100} step={1} unit="µm" onChange={handleParamChange('waveAmplitude')} help="Height of the sine wave."/>
          <Slider label="Frequency" value={params.waveFrequency} min={0.01} max={0.2} step={0.005} unit="" onChange={handleParamChange('waveFrequency')} help="Tightness of the sine wave."/>
        </>;
      case 'radial-spokes':
        return <>
          <Slider label="Spoke Count" value={params.spokeCount} min={4} max={48} step={1} unit="" onChange={handleParamChange('spokeCount')} help="Number of spokes radiating from the center."/>
          <Slider label="Spoke Width" value={params.channelWidth} min={5} max={50} step={1} unit="µm" onChange={handleParamChange('channelWidth')} help="Width of each radial spoke."/>
        </>;
      case 'porous-network':
        return <>
          <Slider label="Avg. Pore Size" value={params.poreSize} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('poreSize')} help="Average diameter of pores."/>
          <Slider label="Porosity" value={params.porosity} min={0.2} max={0.9} step={0.05} unit="%" onChange={handleParamChange('porosity')} help="Ratio of void space to total volume."/>
        </>;
      case 'equiaxed':
        return <>
          <Slider label="Avg. Grain Size" value={params.poreSize} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('poreSize')} help="Average diameter of grains."/>
          <Slider label="Size Variance" value={params.poreSizeVariance} min={0} max={1} step={0.05} unit="" onChange={handleParamChange('poreSizeVariance')} help="Randomness in grain size."/>
          <Slider label="Density" value={params.porosity} min={0.2} max={0.8} step={0.05} unit="%" onChange={handleParamChange('porosity')} help="Packing density of grains."/>
        </>;
      case 'grid-gradient':
        return <>
          <Slider label="Min Pore Size" value={params.gradientStart} min={5} max={100} step={1} unit="µm" onChange={handleParamChange('gradientStart')} help="Pore size at the start of the gradient."/>
          <Slider label="Max Pore Size" value={params.gradientEnd} min={10} max={200} step={1} unit="µm" onChange={handleParamChange('gradientEnd')} help="Pore size at the end of the gradient."/>
        </>;
      case 'concentric-rings':
        return <>
          <Slider label="Ring Spacing" value={params.ringSpacing} min={10} max={100} step={1} unit="µm" onChange={handleParamChange('ringSpacing')} help="Distance between concentric rings."/>
          <Slider label="Ring Width" value={params.ringWidth} min={2} max={50} step={1} unit="µm" onChange={handleParamChange('ringWidth')} help="The thickness of each ring."/>
        </>;
      case 'micropillar-array':
        return <>
          <Slider label="Pillar Diameter" value={params.pillarDiameter} min={5} max={80} step={1} unit="µm" onChange={handleParamChange('pillarDiameter')} help="The diameter of each micropillar."/>
          <Slider label="Pillar Spacing" value={params.pillarSpacing} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('pillarSpacing')} help="The center-to-center distance between pillars."/>
        </>;
      case 'crosshatch-grid':
        return <Slider label="Grid Spacing" value={params.fiberSpacing} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('fiberSpacing')} help="Distance between parallel grid lines."/>;
      case 'tunnels':
        return <>
          <Slider label="Tunnel Width" value={params.channelWidth} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('channelWidth')} help="The width of the empty channel."/>
          <Slider label="Wall Thickness" value={params.wallThickness} min={5} max={100} step={1} unit="µm" onChange={handleParamChange('wallThickness')} help="The thickness of the solid walls between tunnels."/>
        </>;
      case 'lamellar':
        return <>
            <Slider label="Spacing" value={params.fiberSpacing} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('fiberSpacing')} help="Distance between lamellae."/>
            <Slider label="Lamellae Width" value={params.lamellaeWidth} min={5} max={100} step={1} unit="µm" onChange={handleParamChange('lamellaeWidth')} help="Width of the solid bands."/>
        </>;
       case 'dendritic':
        return <>
            <Slider label="Branch Angle" value={params.branchAngle} min={10} max={90} step={1} unit="deg" onChange={handleParamChange('branchAngle')} help="Angle between dendritic branches."/>
            <Slider label="Length Factor" value={params.branchLengthFactor} min={0.5} max={0.95} step={0.01} unit="" onChange={handleParamChange('branchLengthFactor')} help="Ratio of a new branch's length to its parent's."/>
            <Slider label="Iterations" value={params.dendriteIterations} min={1} max={7} step={1} unit="" onChange={handleParamChange('dendriteIterations')} help="Depth of branching recursion. High values are slow."/>
            <Slider label="Base Thickness" value={params.branchThickness} min={1} max={20} step={1} unit="µm" onChange={handleParamChange('branchThickness')} help="Thickness of the main trunk."/>
        </>;
      case 'honeycomb':
        return <Slider label="Hexagon Size" value={params.hexagonSize} min={10} max={100} step={1} unit="µm" onChange={handleParamChange('hexagonSize')} help="The side length of the hexagons."/>;
      case 'cellular':
        return <Slider label="Cell Density" value={params.cellDensity} min={0.0001} max={0.002} step={0.0001} unit="" onChange={handleParamChange('cellDensity')} help="Number of cells per unit area."/>;
      case 'sinusoidal-fibers':
        return <>
            <Slider label="Fiber Spacing" value={params.fiberSpacing} min={10} max={150} step={1} unit="µm" onChange={handleParamChange('fiberSpacing')} help="Distance between sinusoidal fibers."/>
            <Slider label="Amplitude" value={params.waveAmplitude} min={0} max={100} step={1} unit="µm" onChange={handleParamChange('waveAmplitude')} help="Height of the sine wave."/>
            <Slider label="Frequency" value={params.waveFrequency} min={0.01} max={0.2} step={0.005} unit="" onChange={handleParamChange('waveFrequency')} help="Tightness of the sine wave."/>
        </>;
    case 'vortex':
        return <>
            <Slider label="Vortex Strength" value={params.vortexStrength} min={1} max={20} step={0.5} unit="" onChange={handleParamChange('vortexStrength')} help="How quickly the spiral expands."/>
            <Slider label="Spiral Density" value={params.spiralDensity} min={1} max={10} step={0.5} unit="" onChange={handleParamChange('spiralDensity')} help="Number of turns in the spiral."/>
        </>;
    case 'maze':
        return <Slider label="Path Width" value={params.mazePathWidth} min={5} max={80} step={1} unit="µm" onChange={handleParamChange('mazePathWidth')} help="The thickness of the maze walls."/>;
    case 'scherk-tower':
        return <Slider label="Frequency" value={params.scherkFrequency} min={1} max={20} step={0.5} unit="" onChange={handleParamChange('scherkFrequency')} help="The frequency of the periodic surface pattern."/>;
      case 't-junction':
        return <>
          <Slider label="Junction Separation" value={params.junctionSeparation} min={50} max={500} step={5} unit="µm" onChange={handleParamChange('junctionSeparation')} help="Distance between the vertical chambers."/>
          <Slider label="Junction Height" value={params.junctionHeight} min={50} max={500} step={5} unit="µm" onChange={handleParamChange('junctionHeight')} help="Height of the vertical chambers."/>
          <Slider label="Tunnel Width" value={params.tunnelWidth} min={5} max={100} step={1} unit="µm" onChange={handleParamChange('tunnelWidth')} help="Width of all channels."/>
        </>;
      default: return null;
    }
  }, [params, handleParamChange]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-4 h-full overflow-y-auto">
      <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-200">2. Tune Parameters</h2>
          <input 
             type="text" 
             value={params.name} 
             onChange={(e) => setParams(p => ({...p, name: e.target.value}))}
             className="w-full bg-gray-700 text-white p-2 rounded-md mb-4"
           />
      </div>

      <div className="space-y-3 p-3 bg-gray-900/50 rounded-md">
          <h3 className="font-semibold border-b border-gray-600 pb-2 mb-2">Template Geometry</h3>
          {templateControls}
      </div>

      <div className="space-y-3 p-3 bg-gray-900/50 rounded-md">
          <h3 className="font-semibold border-b border-gray-600 pb-2 mb-2">Diffeomorphic Transformation</h3>
          <div>
              <label className="block text-sm font-medium text-gray-300">Transformation Type</label>
              <select value={params.transformId} onChange={handleSelectChange('transformId')} className="w-full mt-1 bg-gray-700 text-white p-2 rounded-md">
                  <option value="none">None</option>
                  <option value="twist">Twist</option>
                  <option value="pinch">Pinch</option>
                  <option value="ripple">Ripple</option>
              </select>
          </div>
          {params.transformId !== 'none' && (
              <Slider label="Strength" value={params.transformStrength} min={0} max={1} step={0.05} unit="" onChange={handleParamChange('transformStrength')} help="Magnitude of the transformation effect."/>
          )}
      </div>

      <div className="space-y-3 p-3 bg-gray-900/50 rounded-md">
          <h3 className="font-semibold border-b border-gray-600 pb-2 mb-2">Height Modulation</h3>
          <div>
              <label className="block text-sm font-medium text-gray-300">Modulation Type</label>
              <select value={params.heightModulationType} onChange={handleSelectChange('heightModulationType')} className="w-full mt-1 bg-gray-700 text-white p-2 rounded-md">
                  <option value="none">None (Uniform)</option>
                  <option value="gradient">Gradient</option>
                  <option value="perlin">Perlin Noise</option>
                  <option value="wave">Wave</option>
              </select>
          </div>
          {params.heightModulationType !== 'none' && (
            <>
              <Slider label="Amplitude" value={params.heightModulationAmplitude} min={0} max={1} step={0.05} unit="" onChange={handleParamChange('heightModulationAmplitude')} help="Strength of the height variation."/>
              {params.heightModulationType === 'gradient' &&
                <Slider label="Angle" value={params.heightModulationGradientAngle} min={0} max={360} step={1} unit="deg" onChange={handleParamChange('heightModulationGradientAngle')} help="Direction of the height gradient."/>
              }
              {(params.heightModulationType === 'perlin' || params.heightModulationType === 'wave') &&
                <Slider label="Frequency" value={params.heightModulationFrequency} min={1} max={50} step={0.5} unit="" onChange={handleParamChange('heightModulationFrequency')} help="Scale/tightness of the height pattern."/>
              }
            </>
          )}
      </div>

      <div className="space-y-3 p-3 bg-gray-900/50 rounded-md">
          <h3 className="font-semibold border-b border-gray-600 pb-2 mb-2">Scaffold Properties</h3>
          <Slider label="Thickness" value={params.thickness} min={5} max={200} step={5} unit="µm" onChange={handleParamChange('thickness')} help="Overall Z-height of the scaffold."/>
          <Slider label="Width" value={params.width} min={100} max={2000} step={10} unit="µm" onChange={handleParamChange('width')} help="Overall X-dimension of the scaffold."/>
          <Slider label="Height" value={params.height} min={100} max={2000} step={10} unit="µm" onChange={handleParamChange('height')} help="Overall Y-dimension of the scaffold."/>
      </div>

      <button onClick={handleRandomize} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">
        Generate Randomized Variant
      </button>
    </div>
  );
};