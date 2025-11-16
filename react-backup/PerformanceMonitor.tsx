'use client';
import React from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

export default function PerformanceMonitor() {
  const { fps = 0, memory = 0, render = 0 } = usePerformanceMonitor() as any;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8 }}>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>
        FPS: <strong>{fps}</strong>
      </div>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>
        Heap MB: <strong>{memory}</strong>
      </div>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>
        Render ms: <strong>{render}</strong>
      </div>
    </div>
  );
}