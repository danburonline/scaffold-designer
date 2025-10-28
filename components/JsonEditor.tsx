import React, { useState, useEffect } from 'react';
import { ScaffoldParams } from '../types';

interface JsonEditorProps {
  params: ScaffoldParams;
  setParams: React.Dispatch<React.SetStateAction<ScaffoldParams>>;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ params, setParams }) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonString(JSON.stringify(params, null, 2));
    setError(null);
  }, [params]);

  const handleApply = () => {
    try {
      const newParams = JSON.parse(jsonString);
      // A simple validation to ensure it's a scaffold-like object
      if (typeof newParams === 'object' && newParams !== null && 'templateId' in newParams) {
        setParams(newParams);
        setError(null);
      } else {
        setError('Invalid scaffold format.');
      }
    } catch (e) {
      setError('Invalid JSON format.');
      console.error(e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).catch(err => {
      console.error('Failed to copy JSON', err);
      alert('Failed to copy JSON to clipboard.');
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-gray-200">JSON Configuration</h2>
      <textarea
        value={jsonString}
        onChange={(e) => setJsonString(e.target.value)}
        className="w-full h-48 bg-gray-900 text-gray-300 font-mono text-xs p-2 rounded-md border border-gray-700 focus:ring-1 focus:ring-gray-400 focus:outline-none"
        spellCheck="false"
        aria-label="JSON Configuration"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex space-x-2 mt-2">
        <button onClick={handleCopy} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Copy</button>
        <button onClick={handleApply} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">Apply JSON</button>
      </div>
    </div>
  );
};
