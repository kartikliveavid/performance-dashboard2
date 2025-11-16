'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type DataPoint = { timestamp: number; value: number; [k: string]: any };
type ContextValue = {
  data: DataPoint[];
  push: (d: DataPoint[]) => void;
  replace: (d: DataPoint[]) => void;
  clear: () => void;
};

const DataContext = createContext<ContextValue | null>(null);

export default function DataProvider({ children, initialData = [] }: { children: ReactNode; initialData?: DataPoint[] }) {
  const [data, setData] = useState<DataPoint[]>(initialData);

  const push = useCallback((d: DataPoint[]) => {
    setData((prev) => {
      const merged = prev.concat(d);
      const max = 100000; // sliding window cap
      return merged.length > max ? merged.slice(merged.length - max) : merged;
    });
  }, []);

  const replace = useCallback((d: DataPoint[]) => setData(d), []);
  const clear = useCallback(() => setData([]), []);

  return <DataContext.Provider value={{ data, push, replace, clear }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}