'use client';

import { useRouter } from 'next/navigation';
import { DicomDataModule } from '@/src/components/modules/DicomDataModule';

export default function DicomPage() {
    const router = useRouter();

    return (
        <DicomDataModule
            onViewStudy={(studyId) => {
                console.log('Viewing study:', studyId);
                router.push('/viewer');
            }}
        />
    );
}
