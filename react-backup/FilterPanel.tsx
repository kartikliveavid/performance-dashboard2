'use client';
import React from 'react';

type Filter = { q?: string; series?: string; min?: number; max?: number };

export default function FilterPanel({
  value,
  onChange,
}: {
  value?: Filter;
  onChange?: (f: Filter) => void;
}) {
  const handle = (patch: Partial<Filter>) => onChange?.({ ...(value || {}), ...patch });

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        aria-label="query"
        placeholder="Filter..."
        defaultValue={value?.q || ''}
        onChange={(e) => handle({ q: e.target.value })}
        style={{ padding: 6 }}
      />
      <input
        aria-label="series"
        placeholder="Series"
        defaultValue={value?.series || ''}
        onChange={(e) => handle({ series: e.target.value })}
        style={{ padding: 6, width: 120 }}
      />
      <input
        aria-label="min"
        type="number"
        placeholder="min"
        defaultValue={value?.min ?? ''}
        onChange={(e) => handle({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
        style={{ padding: 6, width: 80 }}
      />
      <input
        aria-label="max"
        type="number"
        placeholder="max"
        defaultValue={value?.max ?? ''}
        onChange={(e) => handle({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
        style={{ padding: 6, width: 80 }}
      />
      <button onClick={() => onChange?.({})} style={{ padding: '6px 10px' }}>
        Reset
      </button>
    </div>
  );
}