'use client';

import { useEffect, useRef, useState } from 'react';
import { App } from 'dwv';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Move, RotateCcw, Contrast } from 'lucide-react';

interface DicomViewerProps {
    fileUrl: string;
    borderColor?: 'red' | 'yellow' | 'green' | 'blue';
}

export function DicomViewer({ fileUrl, borderColor = 'red' }: DicomViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dwvApp, setDwvApp] = useState<App | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<{
        patientName?: string;
        studyDate?: string;
        modality?: string;
        seriesDescription?: string;
    }>({});

    const borderColors = {
        red: 'border-red-500',
        yellow: 'border-yellow-500',
        green: 'border-green-500',
        blue: 'border-blue-500',
    };

    useEffect(() => {
        if (!containerRef.current || !fileUrl) return;

        // Initialize DWV
        const app = new App();

        // Configure DWV
        app.init({
            dataViewConfigs: {
                '*': [{
                    divId: containerRef.current.id,
                    orientation: 'axial',
                    colourMap: 'plain',
                    opacity: 1,
                    wlPresetName: 'auto',
                    windowCenter: 0,
                    windowWidth: 0
                }]
            },
            tools: {
                Scroll: { options: [] },
                ZoomAndPan: { options: [] },
                WindowLevel: { options: [] },
            },
        } as any);

        // Load DICOM file
        const loadFile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch the file
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                const file = new File([blob], 'dicom.dcm', { type: 'application/dicom' });

                // Load into DWV
                console.log('Loading DICOM file from URL:', fileUrl);
                await app.loadFiles([file]);
                console.log('DWV loadFiles completed');

                // Extract metadata
                const meta = app.getMetaData('0');
                if (meta) {
                    setMetadata({
                        patientName: meta['00100010']?.value?.[0]?.Alphabetic || 'Unknown',
                        studyDate: meta['00080020']?.value?.[0] || 'Unknown',
                        modality: meta['00080060']?.value?.[0] || 'Unknown',
                        seriesDescription: meta['0008103e']?.value?.[0] || 'Unknown',
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading DICOM file:', err);
                setError('Failed to load DICOM file');
                setIsLoading(false);
            }
        };

        loadFile();
        setDwvApp(app);

        return () => {
            // Cleanup
            if (app) {
                // DWV cleanup logic if needed, but avoid resetDisplay here to prevent errors 
                // if unmounting. Usually resetDisplay is for resetting view, not unmounting.
                // app.reset(); // This might be what you want if you meant to clear data
            }
        };
    }, [fileUrl]);

    const handleZoomIn = () => {
        if (dwvApp) {
            dwvApp.setTool('ZoomAndPan');
            // Note: Zoom in/out is handled interactively by the user with mouse wheel or gestures
        }
    };

    const handleZoomOut = () => {
        if (dwvApp) {
            dwvApp.setTool('ZoomAndPan');
            // Note: Zoom in/out is handled interactively by the user with mouse wheel or gestures
        }
    };

    const handleReset = () => {
        if (dwvApp) {
            try {
                dwvApp.resetDisplay();
            } catch (error) {
                console.warn("Reset display failed:", error);
            }
        }
    };

    const handleWindowLevel = () => {
        if (dwvApp) {
            dwvApp.setTool('WindowLevel');
        }
    };

    const handlePan = () => {
        if (dwvApp) {
            dwvApp.setTool('ZoomAndPan');
        }
    };

    return (
        <div className={`relative h-full bg-black border-2 ${borderColors[borderColor]} flex flex-col`}>
            {/* Metadata Overlay */}
            <div className="absolute top-2 left-2 z-10 text-white text-xs space-y-1 pointer-events-none">
                <div>{metadata.patientName}</div>
                <div>{metadata.modality}</div>
                <div>{metadata.seriesDescription}</div>
                <div>{metadata.studyDate}</div>
            </div>

            {/* Tools */}
            <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleWindowLevel}
                    title="Window/Level"
                >
                    <Contrast className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handlePan}
                    title="Pan"
                >
                    <Move className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleZoomIn}
                    title="Zoom In"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleReset}
                    title="Reset"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Viewer Container */}
            <div className="flex-1 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Loading DICOM file...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                        <div className="text-center">
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                <div
                    id={`dwv-${fileUrl.replace(/[^a-zA-Z0-9]/g, '')}`}
                    ref={containerRef}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
