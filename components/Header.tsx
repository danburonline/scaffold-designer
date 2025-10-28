import React from 'react';
import { SaveIcon, DownloadIcon, CubeIcon, LoadingIcon, InfoIcon } from './icons';

interface HeaderProps {
  onSave: () => void;
  onExportPNG: () => void;
  onExportSTL: () => void;
  isGenerating: boolean;
  onShowInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onExportPNG, onExportSTL, isGenerating, onShowInfo }) => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl md:text-2xl font-bold text-gray-100">
        Anisotropic Scaffold Designer
      </h1>
      <div className="flex items-center space-x-2">
         <button onClick={onShowInfo} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          <InfoIcon />
          <span className="hidden md:inline">Info</span>
        </button>
        <button onClick={onSave} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          <SaveIcon />
          <span className="hidden md:inline">Save</span>
        </button>
        <button onClick={onExportPNG} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          <DownloadIcon />
          <span className="hidden md:inline">PNG</span>
        </button>
        <button onClick={onExportSTL} disabled={isGenerating} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-800 disabled:cursor-not-allowed">
          {isGenerating ? <LoadingIcon /> : <CubeIcon />}
          <span className="hidden md:inline">{isGenerating ? 'Generating...' : 'STL'}</span>
        </button>
      </div>
    </header>
  );
};