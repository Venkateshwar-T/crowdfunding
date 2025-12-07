'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoaderContextType = {
  isLoading: boolean;
  message: string | null;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showLoader = (msg: string = '') => {
    setMessage(msg || null);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setMessage(null);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, message, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
