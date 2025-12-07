
import { Suspense } from 'react';
import { DashboardClient } from '@/components/shared/DashboardClient';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="w-full h-[80vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <DashboardClient />
        </Suspense>
    );
}
