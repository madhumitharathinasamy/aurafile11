"use client";

import dynamic from 'next/dynamic';
import { UploaderSkeleton } from '@/components/ui/UploaderSkeleton';

const RemoveBackgroundTool = dynamic(() => import('./RemoveBackgroundTool'), {
    ssr: false,
    loading: () => <UploaderSkeleton type="image" />
});

export default function RemoveBackgroundToolLoader() {
    return <RemoveBackgroundTool />;
}
