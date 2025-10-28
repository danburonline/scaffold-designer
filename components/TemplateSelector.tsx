import React from 'react';
import { TemplateId } from '../types';
import { TEMPLATES } from '../constants';
import { AlignedFibersIcon, GridGradientIcon, PorousNetworkIcon, RadialSpokesIcon, WavyChannelsIcon, ConcentricRingsIcon, MicropillarArrayIcon, CrosshatchGridIcon, TunnelsIcon, LamellarIcon, DendriticIcon, HoneycombIcon, EquiaxedIcon, CellularIcon, SinusoidalFibersIcon, VortexIcon, MazeIcon, ScherkTowerIcon, TJunctionIcon } from './icons';

interface TemplateSelectorProps {
  onSelect: (templateId: TemplateId) => void;
  activeTemplateId: TemplateId;
}

const ICONS: Record<TemplateId, React.FC> = {
    'aligned-fibers': AlignedFibersIcon,
    'lamellar': LamellarIcon,
    'sinusoidal-fibers': SinusoidalFibersIcon,
    'wavy-channels': WavyChannelsIcon,
    'dendritic': DendriticIcon,
    'radial-spokes': RadialSpokesIcon,
    'vortex': VortexIcon,
    'maze': MazeIcon,
    'honeycomb': HoneycombIcon,
    'porous-network': PorousNetworkIcon,
    'equiaxed': EquiaxedIcon,
    'cellular': CellularIcon,
    'scherk-tower': ScherkTowerIcon,
    'grid-gradient': GridGradientIcon,
    'concentric-rings': ConcentricRingsIcon,
    'micropillar-array': MicropillarArrayIcon,
    'crosshatch-grid': CrosshatchGridIcon,
    'tunnels': TunnelsIcon,
    't-junction': TJunctionIcon,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, activeTemplateId }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-gray-200">1. Select a Base Template</h2>
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
        {TEMPLATES.map((template) => {
          const IconComponent = ICONS[template.id];
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              title={template.description}
              className={`p-2 rounded-md transition duration-300 flex flex-col items-center justify-center space-y-1 text-center text-xs aspect-square
                ${activeTemplateId === template.id ? 'bg-gray-600 ring-2 ring-gray-200' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <IconComponent />
              <span className="leading-tight">{template.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};