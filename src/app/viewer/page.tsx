'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViewerToolbar } from '@/src/components/ViewerToolbar';
import { ViewerModule } from '@/src/components/modules/ViewerModule';
import { ViewerSidebar } from '@/src/components/viewer/ViewerSidebar';
import { generateDicomReport } from '@/src/actions/dicom-report';
import { toast } from 'sonner';


import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

export default function ViewerPage() {
    const router = useRouter();
    const viewerLayout = useAppSelector((state) => state.ui.viewerLayout);
    const dispatch = useAppDispatch();

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

            const { toPng } = await import('html-to-image');

            // Small delay to ensure rendering is complete if needed
            await new Promise(r => setTimeout(r, 100));

            const imageData = await toPng(viewerElement, {
                cacheBust: true,
                skipAutoScale: true,
                style: {
                    background: '#101010' // Force background if transparent
                }
            });

            // Find metadata (this would ideally come from DicomViewer state lifting or context)
            // For now, we mock or try to extract from UI if possible, or pass basic info
            // In a real app, ViewerSidebar or a Context would hold the current patient meta
            // Generate random Patient ID
            const randomId = Math.floor(Math.random() * 900000) + 100000;
            const patientId = `PID-${randomId}`;

            // Metadata for report generation
            // Modality and Body Part will be determined by AI in the server action
            const metadata = {
                patientName: patientId,
                studyDate: new Date().toISOString().split('T')[0],
                // We leave modality and bodyPart undefined so the backend AI infers them
            };

            const result = await generateDicomReport({
                imageData,
                reportType: reportType as 'brief' | 'detailed',
                metadata: metadata
            });

            if (result.success) {
                toast.success('Report generated successfully');
                router.push(`/reports?id=${result.reportId}`);
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
                    onGenerateReport={handleGenerateReport}
                    reportType={reportType}
                    onReportTypeChange={setReportType}
                    isGenerating={isGenerating}
                />
                <ViewerModule
                    layout={viewerLayout}
                    imageGenType={'none'} // Simplified as requested
                    selectedFileUrl={selectedFileUrl}
                />
            </div>
        </div>
    );
}
