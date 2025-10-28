import React from 'react';

interface InfoModalProps {
  show: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 text-gray-200 rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-100">About this Application</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <p>
            This application is a design tool for students and researchers in <strong>neural tissue engineering</strong>. Its purpose is to create anisotropic microstructure templates for scaffolds used to culture neural progenitor cells.
          </p>
          <p>
            The generated designs can be exported as 3D-printable files (STL) or 2D images (PNG). These scaffolds provide topographic cues to guide neurite outgrowth and tissue formation.
          </p>
          <h3 className="text-lg font-semibold text-gray-200 pt-2">How it Works:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Select a Base Template:</strong> Choose from a gallery of predefined microstructures, including both anisotropic (direction-dependent) and isotropic (uniform) patterns.</li>
            <li><strong>Tune Parameters:</strong> Use the sliders to intuitively adjust geometric properties like fiber spacing, pore size, and channel curvature within biologically plausible ranges (5-200 µm).</li>
            <li><strong>Apply Transformations:</strong> Use diffeomorphic transformations (e.g., twist, pinch) to create smooth, topology-preserving variations of the base templates.</li>
            <li><strong>Save & Export:</strong> Save your favorite designs to the local archive and export them as PNGs for documentation or STLs for 3D printing.</li>
          </ul>
          <p className="pt-2 text-sm text-gray-400">
            The ultimate goal is to generate diverse datasets of tissue growth over time, which can be used to train generative foundation models for tissue engineering.
          </p>
        </div>

        <div className="mt-6 text-right">
          <button 
            onClick={onClose} 
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};