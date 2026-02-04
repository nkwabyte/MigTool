'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Move, RotateCcw, Contrast } from 'lucide-react';
import { RenderingEngine, Enums, Types } from '@cornerstonejs/core';
import {
    ToolGroupManager,
    Enums as ToolEnums,
    WindowLevelTool,
    PanTool,
    ZoomTool,
    StackScrollTool,
} from '@cornerstonejs/tools';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { initCornerstone } from '@/src/lib/cornerstone-init';

interface DicomViewerProps {
    fileUrl: string;
    borderColor?: 'red' | 'yellow' | 'green' | 'blue';
}

export function DicomViewer({ fileUrl, borderColor = 'red' }: DicomViewerProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const renderingEngineRef = useRef<any>(null);
    const [viewportId] = useState('CT_VIEWPORT');
    const [renderingEngineId] = useState('myRenderingEngine');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize Cornerstone
    useEffect(() => {
        const setup = async () => {
            try {
                await initCornerstone();

                if (!elementRef.current) return;

                // Create Rendering Engine
                const renderingEngine = new RenderingEngine(renderingEngineId);
                renderingEngineRef.current = renderingEngine;

                // Enable Element
                const viewportInput = {
                    viewportId,
                    type: Enums.ViewportType.STACK,
                    element: elementRef.current,
                    defaultOptions: {
                        background: [0.06, 0.06, 0.06] as [number, number, number], // #101010
                    },
                };

                renderingEngine.enableElement(viewportInput);

                // Add Tools
                // Note: Tools should be added to ToolGroup globally or per viewport
                // We'll create a tool group
                const toolGroupId = 'defaultToolGroup';
                const toolGroup = ToolGroupManager.createToolGroup(toolGroupId) || ToolGroupManager.getToolGroup(toolGroupId);

                if (toolGroup) {
                    // Add tools to the library (only need to do once globally, but safe to call multiple times)
                    cornerstoneTools.addTool(ZoomTool);
                    cornerstoneTools.addTool(PanTool);
                    cornerstoneTools.addTool(WindowLevelTool);
                    cornerstoneTools.addTool(StackScrollTool);

                    // Add tools to ToolGroup
                    toolGroup.addTool(ZoomTool.toolName);
                    toolGroup.addTool(PanTool.toolName);
                    toolGroup.addTool(WindowLevelTool.toolName);
                    toolGroup.addTool(StackScrollTool.toolName);

                    // Set Active Tools
                    toolGroup.setToolActive(WindowLevelTool.toolName, {
                        bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
                    });
                    toolGroup.setToolActive(PanTool.toolName, {
                        bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }], // Middle
                    });
                    toolGroup.setToolActive(ZoomTool.toolName, {
                        bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }], // Right
                    });
                    // Enable scroll
                    toolGroup.setToolActive(StackScrollTool.toolName, {
                        bindings: [{ mouseButton: ToolEnums.MouseBindings.Wheel }], // Note: MouseBindings.Wheel often doesn't exist, this might need custom binding or check
                    });

                    toolGroup.addViewport(viewportId, renderingEngineId);
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Cornerstone setup failed", err);
                setError("Failed to initialize viewer");
                setIsLoading(false);
            }
        };

        setup();

        return () => {
            if (renderingEngineRef.current) {
                renderingEngineRef.current.destroy();
            }
            // Cleanup toolgroups?
        };
    }, []);

    // Load Image
    useEffect(() => {
        const loadDicom = async () => {
            if (!fileUrl || !renderingEngineRef.current) return;

            try {
                setIsLoading(true);

                // Construct Image Id
                // If it's a local path from public, we often need 'wadouri:' prefix and full URL
                // e.g. wadouri:http://localhost:3000/dicom/file.dcm
                const fullUrl = fileUrl.startsWith('http')
                    ? fileUrl
                    : `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

                const imageId = `wadouri:${fullUrl}`;

                const viewport = renderingEngineRef.current.getViewport(viewportId) as any;

                if (viewport) {
                    await viewport.setStack([imageId]);
                    viewport.render();
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Error loading DICOM:", err);
                setError("Failed to load image");
                setIsLoading(false);
            }
        };

        loadDicom();
    }, [fileUrl]);

    const borderColors = {
        red: 'border-red-500',
        yellow: 'border-yellow-500',
        green: 'border-green-500',
        blue: 'border-blue-500',
    };

    // Helper to switch active tool (for toolbar buttons)
    const activateTool = (toolName: string) => {
        const toolGroup = ToolGroupManager.getToolGroup('defaultToolGroup');
        if (toolGroup) {
            toolGroup.setToolActive(toolName, {
                bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
            });
            // Reset others to passive if needed, or just let them coexist if bindings differ
            // For simple left-click switch:
            const tools = [WindowLevelTool.toolName, PanTool.toolName, ZoomTool.toolName];
            tools.forEach(t => {
                if (t !== toolName) {
                    toolGroup.setToolPassive(t);
                }
            });
        }
    };

    // ... (keep Metadata state and render logic, adapting tools buttons to call activateTool)

    return (
        <div className={`relative h-full bg-[#101010] border-2 ${borderColors[borderColor]} flex flex-col`}>
            {/* Tools Overlay */}
            <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => activateTool(WindowLevelTool.toolName)} title="Window/Level">
                    <Contrast className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => activateTool(PanTool.toolName)} title="Pan">
                    <Move className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => activateTool(ZoomTool.toolName)} title="Zoom">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                {/* Reset is slightly complex with CS3D, usually reset viewport camera */}
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => {
                        const viewport = renderingEngineRef.current?.getViewport(viewportId);
                        viewport?.resetCamera();
                        viewport?.render();
                    }} title="Reset">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Viewer Container */}
            <div className="flex-1 relative overflow-hidden" ref={elementRef}
                onContextMenu={(e) => e.preventDefault()} // Disable native context menu
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 z-20">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
