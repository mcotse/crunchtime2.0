import React from 'react';
interface SectionLabelProps {
  children: React.ReactNode;
  error?: boolean;
}
export function SectionLabel({
  children,
  error
}: SectionLabelProps) {
  return <span className="text-[13px] font-medium uppercase tracking-widest" style={{
    color: error ? 'var(--eqx-coral)' : 'var(--eqx-secondary)'
  }}>
      {children}
    </span>;
}