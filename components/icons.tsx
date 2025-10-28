import React from 'react';

export const SaveIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const CubeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7v10l8 4m0-14V3" />
    </svg>
);

export const LoadingIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const LoadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M5 9a7 7 0 107-7" />
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


// Template Icons
const TemplateIconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        {children}
    </svg>
);

export const AlignedFibersIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 4V20" />
        <path d="M8 4V20" />
        <path d="M12 4V20" />
        <path d="M16 4V20" />
        <path d="M20 4V20" />
    </TemplateIconBase>
);

export const WavyChannelsIcon: React.FC = () => (
    <TemplateIconBase>
         <path d="M4 6s2-4 4-4 4 4 4 4-2 4-4 4-4-4-4-4z" />
         <path d="M12 14s2-4 4-4 4 4 4 4-2 4-4 4-4-4-4-4z" />
         <path d="M4 14s2-4 4-4 4 4 4 4-2 4-4 4-4-4-4-4z" />
    </TemplateIconBase>
);

export const RadialSpokesIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" />
    </TemplateIconBase>
);

export const PorousNetworkIcon: React.FC = () => (
    <TemplateIconBase>
        <circle cx="6" cy="6" r="2" />
        <circle cx="14" cy="5" r="1.5" />
        <circle cx="18" cy="11" r="2" />
        <circle cx="11" cy="18" r="2.5" />
        <circle cx="5" cy="15" r="1" />
    </TemplateIconBase>
);

export const GridGradientIcon: React.FC = () => (
    <TemplateIconBase>
        <circle cx="4" cy="4" r="1" />
        <circle cx="10" cy="4" r="1.5" />
        <circle cx="16" cy="4" r="2" />
        <circle cx="4" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="2" />
        <circle cx="16" cy="10" r="2.5" />
        <circle cx="4" cy="16" r="2" />
        <circle cx="10" cy="16" r="2.5" />
        <circle cx="16"cy="16" r="3" />
    </TemplateIconBase>
);

export const ConcentricRingsIcon: React.FC = () => (
    <TemplateIconBase>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="11" />
    </TemplateIconBase>
);

export const MicropillarArrayIcon: React.FC = () => (
    <TemplateIconBase stroke="none" fill="currentColor">
        <circle cx="6" cy="6" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="12" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
    </TemplateIconBase>
);

export const CrosshatchGridIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 8h16M4 16h16M8 4v16M16 4v16" />
    </TemplateIconBase>
);

export const TunnelsIcon: React.FC = () => (
    <TemplateIconBase stroke="none" fill="currentColor">
        <rect x="2" y="2" width="6" height="20" rx="1" />
        <rect x="16" y="2" width="6" height="20" rx="1" />
    </TemplateIconBase>
);

export const LamellarIcon: React.FC = () => (
    <TemplateIconBase stroke="none" fill="currentColor">
        <rect x="3" y="3" width="4" height="18" rx="1" />
        <rect x="10" y="3" width="4" height="18" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
    </TemplateIconBase>
);

export const DendriticIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M12 20V12M9 14l-4-2M15 14l4-2" />
        <path d="M12 12V4M9 6l-4-2M15 6l4-2" />
    </TemplateIconBase>
);

export const HoneycombIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 8l4-2 4 2v4l-4 2-4-2z" />
        <path d="M12 8l4-2 4 2v4l-4 2-4-2z" />
        <path d="M8 14l4-2 4 2v4l-4 2-4-2z" />
    </TemplateIconBase>
);

export const EquiaxedIcon: React.FC = () => (
    <TemplateIconBase stroke="none" fill="currentColor">
        <circle cx="7" cy="7" r="3" />
        <circle cx="15" cy="6" r="4" />
        <circle cx="17" cy="15" r="3.5" />
        <circle cx="8" cy="18" r="4" />
        <circle cx="5" cy="13" r="2" />
    </TemplateIconBase>
);

export const CellularIcon: React.FC = () => (
    <TemplateIconBase strokeWidth="1">
        <path d="M5 8l-2 3 2 3h4l2-3-2-3H5z" />
        <path d="M9 8l4-1 3 3-1 4-4 1-3-3 1-4z" />
        <path d="M13 14l-1 4 4 1 3-2-1-4-5-_z" />
        <path d="M8 17l-4 .5-1-4 .5-3 4-1z" />
    </TemplateIconBase>
);

export const SinusoidalFibersIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 8 C8 4, 16 12, 20 8" />
        <path d="M4 16 C8 12, 16 20, 20 16" />
    </TemplateIconBase>
);

export const VortexIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M12 12 m -10, 0 a 10,10 0 1,0 20,0 M12 12 m -6, 0 a 6,6 0 1,0 12,0 M12 12 m -2, 0 a 2,2 0 1,0 4,0" />
    </TemplateIconBase>
);

export const MazeIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 4h16v16h-4v-8h-8v-4h4V4H8" />
        <path d="M12 12h4v4" />
    </TemplateIconBase>
);

export const ScherkTowerIcon: React.FC = () => (
    <TemplateIconBase>
        <path d="M4 4 Q 8 8, 4 12 T 4 20" />
        <path d="M12 4 Q 16 8, 12 12 T 12 20" />
        <path d="M20 4 Q 16 8, 20 12 T 20 20" />
        <path d="M4 4 Q 8 8, 12 4 T 20 4" />
        <path d="M4 12 Q 8 16, 12 12 T 20 12" />
    </TemplateIconBase>
);

export const TJunctionIcon: React.FC = () => (
    <TemplateIconBase stroke="none" fill="currentColor">
        <rect x="5" y="4" width="3" height="16" />
        <rect x="16" y="4" width="3" height="16" />
        <rect x="5" y="10" width="14" height="4" />
    </TemplateIconBase>
);