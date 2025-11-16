'use client';
import React from 'react';

const RANGES = ['10s', '30s', '1m', '5m', '1h', 'All'] as const;

export default function TimeRangeSelector({
  value,
  onSelect,
}: {
  value?: string;
  onSelect?: (r: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onSelect?.(r)}
          aria-pressed={value === r}
          style={{
            padding: '6px 10px',
            background: value === r ? '#111827' : '#fff',
            color: value === r ? '#fff' : '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}