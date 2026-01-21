'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ViewerToolbar } from '@/src/components/ViewerToolbar';
import { ViewerModule } from '@/src/components/modules/ViewerModule';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addReport, Report } from '@/src/store/slices/reportsSlice';

export default function ViewerPage() {
    const router = useRouter();
    const viewerLayout = useAppSelector((state) => state.ui.viewerLayout);
    const dispatch = useAppDispatch();

    const [heatmapIntensity, setHeatmapIntensity] = useState(0);
    const [reportType, setReportType] = useState('none');
    const [imageGenType, setImageGenType] = useState('ct-to-mri');

    const generateBriefReport = () => {
        return `CLINICAL INDICATION:\nAcute onset neurological symptoms.\n\nTECHNIQUE:\nNon-contrast CT and MRI of the brain.\n\nFINDINGS:\nMultiple hypodense areas in left cerebral hemisphere on CT. MRI confirms restricted diffusion consistent with acute ischemic changes. No hemorrhage detected.\n\nIMPRESSION:\nAcute ischemic stroke in left MCA territory. Immediate intervention recommended.`;
    };

    const generateDetailedReport = () => {
        return `CLINICAL INDICATION:\nPatient presents with acute onset left-sided weakness and speech difficulties. Evaluate for acute cerebrovascular accident.\n\nTECHNIQUE:\nNon-contrast CT of the head was performed with 5mm axial slices. Subsequently, multiplanar MRI brain was obtained including DWI, FLAIR, T1, and T2 sequences.\n\nCOMPARISON:\nNo prior imaging available for comparison.\n\nFINDINGS:\n\nBrain Parenchyma:\nMultiple well-defined hypodense regions are identified in the left middle cerebral artery (MCA) territory on CT imaging, measuring approximately 3.5 x 2.8 cm. The MRI demonstrates restricted diffusion in these areas with corresponding high signal on DWI and low signal on ADC maps, confirming acute ischemic stroke.\n\nMass Effect:\nThere is associated mass effect with approximately 4mm rightward midline shift. The left lateral ventricle shows mild compression. No transtentorial or subfalcine herniation at this time.\n\nHemorrhage:\nNo evidence of acute or chronic hemorrhage. No hemorrhagic transformation of the infarct.\n\nVascular Structures:\nThe visualized intracranial vessels demonstrate no gross abnormality on this non-contrast study. Circle of Willis appears intact.\n\nExtra-axial Spaces:\nNo extra-axial fluid collection. Ventricular system is normal in size and configuration aside from the aforementioned left lateral ventricle compression.\n\nOsseous Structures:\nVisualized osseous structures demonstrate no acute fracture or lytic lesion.\n\nIMPRESSION:\n1. Acute ischemic stroke involving the left middle cerebral artery territory with early mass effect and 4mm rightward midline shift.\n2. No hemorrhagic conversion identified at this time.\n3. Recommend immediate clinical correlation and consideration for endovascular intervention within the therapeutic window.\n4. Follow-up imaging recommended to assess for hemorrhagic transformation and progression of ischemic changes.`;
    };

    const handleGenerateReport = () => {
        if (reportType === 'none') return;

        // Generate report based on current viewer state
        const newReport: Report = {
            id: `report-${Date.now()}`,
            patientName: 'Smith, John',
            patientId: 'MRN-123456',
            studyDate: '2024-11-20',
            modality: 'CT/MRI',
            bodyPart: 'Head',
            description: 'CT and MRI Brain comparison study',
            status: 'Finalized',
            radiologist: 'Dr. Sarah Johnson',
            reportType: reportType as 'brief' | 'detailed',
            reportText: reportType === 'brief'
                ? generateBriefReport()
                : generateDetailedReport(),
            findings: reportType === 'brief'
                ? 'Multiple hypodense areas noted in the left cerebral hemisphere consistent with acute ischemic changes. No evidence of hemorrhage. Mass effect present with mild midline shift.'
                : 'The CT scan demonstrates multiple well-defined hypodense regions in the left middle cerebral artery (MCA) territory, measuring approximately 3.5 x 2.8 cm. The corresponding MRI shows restricted diffusion in these areas, confirming acute ischemic stroke. There is associated mass effect with approximately 4mm rightward midline shift. The ventricular system shows mild compression of the left lateral ventricle. No evidence of hemorrhagic transformation. Gray-white matter differentiation is preserved in the unaffected regions.',
            impression: reportType === 'brief'
                ? 'Acute ischemic stroke in left MCA territory. Recommend immediate intervention.'
                : 'Acute ischemic stroke involving the left middle cerebral artery territory with early mass effect and midline shift. No hemorrhagic conversion identified. Clinical correlation recommended with immediate consideration for endovascular intervention within the therapeutic window. Follow-up imaging recommended to assess for hemorrhagic transformation and progression of ischemic changes.',
            images: [
                { url: '/assets/ct_image.png', label: 'CT Brain - Axial View' },
                { url: '/assets/mri_image.png', label: 'MRI Brain - Axial View' }
            ],
            generatedDate: new Date().toISOString()
        };

        dispatch(addReport(newReport));
        // Navigate to reports module
        router.push('/reports');
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ViewerToolbar
                heatmapIntensity={heatmapIntensity}
                onHeatmapChange={(value) => setHeatmapIntensity(value[0])}
                onGenerateReport={handleGenerateReport}
                reportType={reportType}
                onReportTypeChange={setReportType}
                imageGenType={imageGenType}
                onImageGenTypeChange={setImageGenType}
            />
            <ViewerModule
                layout={viewerLayout}
                heatmapIntensity={heatmapIntensity}
                imageGenType={imageGenType}
            />
        </div>
    );
}
