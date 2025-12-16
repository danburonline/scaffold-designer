
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TemplateSelector } from './components/TemplateSelector';
import { ParameterControls } from './components/ParameterControls';
import { CanvasRenderer } from './components/CanvasRenderer';
import { DesignArchive } from './components/DesignArchive';
import { InfoModal } from './components/InfoModal';
import { JsonEditor } from './components/JsonEditor';
import { exportToPNG, exportToSTL } from './utils/export';
import { ScaffoldParams, TemplateId } from './types';
import { DEFAULT_PARAMS } from './constants';
import { drawScaffold } from './utils/drawing';

const App: React.FC = () => {
  const [params, setParams] = useState<ScaffoldParams>({
    ...DEFAULT_PARAMS['serpentine-mesh'],
    id: crypto.randomUUID(),
    name: 'New Serpentine Design'
  });
  const [savedDesigns, setSavedDesigns] = useState<ScaffoldParams[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const storedDesigns = localStorage.getItem('scaffoldDesigns');
      if (storedDesigns) {
        setSavedDesigns(JSON.parse(storedDesigns));
      }
    } catch (error) {
      console.error("Failed to load designs from local storage:", error);
    }
  }, []);

  const handleSaveDesign = useCallback(() => {
    const newName = prompt("Enter a name for this design:", params.name);
    if (newName) {
      const designToSave = { ...params, name: newName, id: crypto.randomUUID() };
      const updatedDesigns = [...savedDesigns, designToSave];
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('scaffoldDesigns', JSON.stringify(updatedDesigns));
      alert(`Design "${newName}" saved!`);
    }
  }, [params, savedDesigns]);

  const handleLoadDesign = useCallback((id: string) => {
    const designToLoad = savedDesigns.find(d => d.id === id);
    if (designToLoad) {
      setParams(designToLoad);
    }
  }, [savedDesigns]);
  
  const handleDeleteDesign = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this design?")) {
      const updatedDesigns = savedDesigns.filter(d => d.id !== id);
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('scaffoldDesigns', JSON.stringify(updatedDesigns));
    }
  }, [savedDesigns]);

  const handleTemplateSelect = useCallback((templateId: TemplateId) => {
    setParams({
      ...DEFAULT_PARAMS[templateId],
      id: crypto.randomUUID(),
      name: `New ${templateId.replace('-', ' ')} Design`
    });
  }, []);

  const handleExportPNG = useCallback(() => {
    // We generate PNGs using a hidden canvas to ensure we export the grayscale masks, not the colored preview.
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 512;
    exportCanvas.height = 512;
    const ctx = exportCanvas.getContext('2d');
    
    if (ctx) {
        const count = params.materialCount || 1;
        for (let i = 0; i < count; i++) {
            drawScaffold(ctx, params, { materialIndex: i, preview: false });
            // Add a small delay for sequential downloads if needed, though browsers might handle it.
            // Suffix filename with material index if > 1
            const filename = count > 1 ? `${params.name}_mat${i+1}.png` : `${params.name}.png`;
            exportToPNG(exportCanvas, filename);
        }
    }
  }, [params]);

  const handleExportSTL = useCallback(() => {
    setIsGenerating(true);
    // Use setTimeout to allow the UI to update to the loading state
    setTimeout(() => {
      try {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 512;
        exportCanvas.height = 512;
        const ctx = exportCanvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
            const count = params.materialCount || 1;
            for (let i = 0; i < count; i++) {
                drawScaffold(ctx, params, { materialIndex: i, preview: false });
                const filename = count > 1 ? `${params.name}_mat${i+1}.stl` : `${params.name}.stl`;
                exportToSTL(exportCanvas, params, filename);
            }
        }
      } catch (error) {
        console.error("STL Generation failed:", error);
        alert("Failed to generate STL file. The design may be too complex.");
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  }, [params]);

  return (
    <>
      <InfoModal show={showInfoModal} onClose={() => setShowInfoModal(false)} />
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
        <Header
          onSave={handleSaveDesign}
          onExportPNG={handleExportPNG}
          onExportSTL={handleExportSTL}
          isGenerating={isGenerating}
          onShowInfo={() => setShowInfoModal(true)}
        />
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
          <div className="lg:col-span-3 space-y-4">
            <TemplateSelector onSelect={handleTemplateSelect} activeTemplateId={params.templateId} />
            <DesignArchive designs={savedDesigns} onLoad={handleLoadDesign} onDelete={handleDeleteDesign} />
            <JsonEditor params={params} setParams={setParams} />
          </div>
          <div className="lg:col-span-6 flex items-center justify-center bg-gray-800 rounded-lg shadow-lg p-2 aspect-square">
            <CanvasRenderer ref={canvasRef} params={params} />
          </div>
          <div className="lg:col-span-3">
            <ParameterControls params={params} setParams={setParams} />
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
