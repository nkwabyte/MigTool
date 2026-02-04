'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViewerToolbar } from '@/src/components/ViewerToolbar';
import { ViewerModule } from '@/src/components/modules/ViewerModule';
import { ViewerSidebar } from '@/src/components/viewer/ViewerSidebar';
import { generateDicomReport } from '@/src/actions/dicom-report';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addReport, Report } from '@/src/store/slices/reportsSlice';

export default function ViewerPage() {
    const router = useRouter();
    const viewerLayout = useAppSelector((state) => state.ui.viewerLayout);
    const dispatch = useAppDispatch();

    const [heatmapIntensity, setHeatmapIntensity] = useState(0);
    const [reportType, setReportType] = useState('none');

    const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        if (reportType === 'none' || !selectedFileUrl) {
            toast.error('Please select a file and report type first');
            return;
        }

        setIsGenerating(true);
        try {
            // Capture the viewer content
            const viewerElement = document.getElementById('viewer-content');
            if (!viewerElement) {
                throw new Error('Viewer element not found');
            }

            // Small delay to ensure rendering is complete if needed
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(viewerElement, {
                useCORS: true,
                logging: false,
                ignoreElements: (element) => {
                    // Ignore UI overlay elements if they have specific classes like 'toolbar' or 'sidebar'
                    // For now, capturing everything inside viewer-content is fine
                    return false;
                }
            });
            const imageData = canvas.toDataURL('image/png');

            // Find metadata (this would ideally come from DicomViewer state lifting or context)
            // For now, we mock or try to extract from UI if possible, or pass basic info
            // In a real app, ViewerSidebar or a Context would hold the current patient meta
            const mockMetadata = {
                patientName: "JOHN DOE", // Ideally extracted
                modality: "CR",
                bodyPart: "CHEST",
                studyDate: new Date().toISOString().split('T')[0]
            };

            const result = await generateDicomReport({
                imageData,
                reportType: reportType as 'brief' | 'detailed',
                metadata: mockMetadata
            });

            if (result.success) {
                toast.success('Report generated successfully');
                router.push('/reports');
            } else {
                toast.error('Failed to generate report: ' + result.error);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            <ViewerSidebar
                onFileSelect={setSelectedFileUrl}
                selectedFileUrl={selectedFileUrl}
            />
            <div className="flex-1 flex flex-col overflow-hidden" id="viewer-content">
                <ViewerToolbar
                    heatmapIntensity={heatmapIntensity}
                    onHeatmapChange={(value) => setHeatmapIntensity(value[0])}
                    onGenerateReport={handleGenerateReport}
                    reportType={reportType}
                    onReportTypeChange={setReportType}
                    isGenerating={isGenerating}
                />
                <ViewerModule
                    layout={viewerLayout}
                    heatmapIntensity={heatmapIntensity}
                    imageGenType={'none'} // Simplified as requested
                    selectedFileUrl={selectedFileUrl}
                />
            </div>
        </div>
    );
}
