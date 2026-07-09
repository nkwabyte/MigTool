import { Suspense } from 'react';
import { ReportsModule } from '@/src/components/modules/ReportsModule';

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading reports...</div>}>
            <ReportsModule />
        </Suspense>
    );
}
