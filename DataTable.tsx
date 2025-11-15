'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';

type Row = { id?: string | number; timestamp?: number | string; value?: number | string; metadata?: any };

export default function DataTable({
  rows,
  height = 300,
  rowHeight = 32,
  overscan = 5,
}: {
  rows: Row[];
  height?: number;
  rowHeight?: number;
  overscan?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = rows.length * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(rows.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const visible = useMemo(() => rows.slice(startIndex, endIndex), [rows, startIndex, endIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * rowHeight}px)` }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {visible.map((r, i) => (
                <tr key={r.id ?? startIndex + i} style={{ height: rowHeight, borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 8px', width: 160 }}>{String(r.timestamp ?? '')}</td>
                  <td style={{ padding: '6px 8px' }}>{String(r.value ?? '')}</td>
                  <td style={{ padding: '6px 8px', color: '#6b7280' }}>{JSON.stringify(r.metadata ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}