'use client';

import { Suspense } from 'react';
import MainLayout from './MainLayout';

// Common loading fallback for client components
export const DefaultLoading = () => (
  <MainLayout>
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  </MainLayout>
);

// Wrapper for client components that use navigation hooks or other hooks that require Suspense
export default function ClientOnly({ children, fallback }) {
  const LoadingFallback = fallback || DefaultLoading;
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}
