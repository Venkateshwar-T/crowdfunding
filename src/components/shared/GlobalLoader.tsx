'use client';

import { Loader2 } from 'lucide-react';
import { useLoader } from '@/contexts/LoaderContext';

export function GlobalLoader() {
  const { isLoading, message } = useLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      {message && <p className="mt-4 text-lg text-white font-semibold">{message}</p>}
    </div>
  );
}
