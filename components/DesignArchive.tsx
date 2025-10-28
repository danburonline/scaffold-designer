import React from 'react';
import { ScaffoldParams } from '../types';
import { LoadIcon, TrashIcon } from './icons';

interface DesignArchiveProps {
  designs: ScaffoldParams[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DesignArchive: React.FC<DesignArchiveProps> = ({ designs, onLoad, onDelete }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-gray-200">Design Archive</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {designs.length === 0 ? (
          <p className="text-gray-400 text-sm">No saved designs. Click 'Save' to archive a design.</p>
        ) : (
          designs.map(design => (
            <div key={design.id} className="bg-gray-700 p-2 rounded-md flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{design.name}</span>
                <span className="text-xs text-gray-400 capitalize">{design.templateId.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => onLoad(design.id)} title="Load design" className="p-1 text-gray-300 hover:text-white transition-colors">
                  <LoadIcon />
                </button>
                <button onClick={() => onDelete(design.id)} title="Delete design" className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};