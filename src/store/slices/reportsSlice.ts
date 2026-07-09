import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Report {
    id: string;
    patientName: string;
    patientId: string;
    studyDate: string;
    modality: string;
    bodyPart: string;
    description: string;
    status: string;
    radiologist: string;
    reportType: 'brief' | 'detailed';
    reportText: string;
    findings: string;
    impression: string;
    images: {
        url: string;
        label: string;
    }[];
    generatedDate: string;
}

interface ReportsState {
    reports: Report[];
}

const initialState: ReportsState = {
    reports: [
        // Brief Report
        {
            id: 'report-default-brief',
            patientName: 'Johnson, Emily',
            patientId: 'MRN-987654',
            studyDate: '2024-11-25',
            modality: 'CT',
            bodyPart: 'Head',
            description: 'CT Head - Routine follow-up',
            status: 'Finalized',
            radiologist: 'Dr. Michael Chen',
            reportType: 'brief',
            reportText: `CLINICAL INDICATION:\nFollow-up for previously identified lesion.\n\nTECHNIQUE:\nNon-contrast CT of the head.\n\nFINDINGS:\nPreviously identified small hypodense lesion in the right frontal lobe is stable in size and appearance. No new areas of abnormality. Ventricular system is normal. No mass effect or midline shift.\n\nIMPRESSION:\nStable appearance of right frontal lesion. No acute findings.`,
            findings: 'Small stable hypodense lesion in right frontal lobe. No new abnormalities identified. Normal ventricular system.',
            impression: 'Stable right frontal lesion. No acute intracranial abnormality. Recommend continued clinical follow-up.',
            images: [
                { url: '/assets/ct_image.png', label: 'CT Brain - Axial View' },
                { url: '/assets/mri_image.png', label: 'CT Brain - Coronal View' }
            ],
            generatedDate: new Date('2024-11-25T10:30:00').toISOString()
        },
        // Detailed Report
        {
            id: 'report-default-detailed',
            patientName: 'Smith, John',
            patientId: 'MRN-123456',
            studyDate: '2024-11-20',
            modality: 'CT/MRI',
            bodyPart: 'Head',
            description: 'CT and MRI Brain comparison study',
            status: 'Finalized',
            radiologist: 'Dr. Sarah Johnson',
            reportType: 'detailed',
            reportText: `CLINICAL INDICATION:\nPatient presents with acute onset left-sided weakness and speech difficulties. Evaluate for acute cerebrovascular accident.\n\nTECHNIQUE:\nNon-contrast CT of the head was performed with 5mm axial slices. Subsequently, multiplanar MRI brain was obtained including DWI, FLAIR, T1, and T2 sequences.\n\nCOMPARISON:\nNo prior imaging available for comparison.\n\nFINDINGS:\n\nBrain Parenchyma:\nMultiple well-defined hypodense regions are identified in the left middle cerebral artery (MCA) territory on CT imaging, measuring approximately 3.5 x 2.8 cm. The MRI demonstrates restricted diffusion in these areas with corresponding high signal on DWI and low signal on ADC maps, confirming acute ischemic stroke.\n\nMass Effect:\nThere is associated mass effect with approximately 4mm rightward midline shift. The left lateral ventricle shows mild compression. No transtentorial or subfalcine herniation at this time.\n\nHemorrhage:\nNo evidence of acute or chronic hemorrhage. No hemorrhagic transformation of the infarct.\n\nVascular Structures:\nThe visualized intracranial vessels demonstrate no gross abnormality on this non-contrast study. Circle of Willis appears intact.\n\nExtra-axial Spaces:\nNo extra-axial fluid collection. Ventricular system is normal in size and configuration aside from the aforementioned left lateral ventricle compression.\n\nOsseous Structures:\nVisualized osseous structures demonstrate no acute fracture or lytic lesion.\n\nIMPRESSION:\n1. Acute ischemic stroke involving the left middle cerebral artery territory with early mass effect and 4mm rightward midline shift.\n2. No hemorrhagic conversion identified at this time.\n3. Recommend immediate clinical correlation and consideration for endovascular intervention within the therapeutic window.\n4. Follow-up imaging recommended to assess for hemorrhagic transformation and progression of ischemic changes.`,
            findings: 'The CT scan demonstrates multiple well-defined hypodense regions in the left middle cerebral artery (MCA) territory, measuring approximately 3.5 x 2.8 cm. The corresponding MRI shows restricted diffusion in these areas, confirming acute ischemic stroke. There is associated mass effect with approximately 4mm rightward midline shift. The ventricular system shows mild compression of the left lateral ventricle. No evidence of hemorrhagic transformation. Gray-white matter differentiation is preserved in the unaffected regions.',
            impression: 'Acute ischemic stroke involving the left middle cerebral artery territory with early mass effect and midline shift. No hemorrhagic conversion identified. Clinical correlation recommended with immediate consideration for endovascular intervention within the therapeutic window. Follow-up imaging recommended to assess for hemorrhagic transformation and progression of ischemic changes.',
            images: [
                { url: '/assets/ct_image.png', label: 'CT Brain - Axial View' },
                { url: '/assets/mri_image.png', label: 'MRI Brain - Axial View' }
            ],
            generatedDate: new Date('2024-11-20T14:45:00').toISOString()
        }
    ]
};

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        addReport: (state, action: PayloadAction<Report>) => {
            state.reports.unshift(action.payload);
        },
    },
});

export const { addReport } = reportsSlice.actions;
export default reportsSlice.reducer;
