import React from 'react';
import { Member } from '../data/mockData';
interface AvatarStackProps {
  memberIds: string[];
  members: Member[];
  max?: number;
}
export function AvatarStack({
  memberIds,
  members,
  max = 5
}: AvatarStackProps) {
  const shown = memberIds.slice(0, max);
  const overflow = memberIds.length - max;
  return <div className="flex items-center">
      {shown.map((id, i) => {
      const m = members.find((mb) => mb.id === id);
      if (!m) return null;
      return <div key={id} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold border" style={{
        backgroundColor: m.color,
        borderColor: 'var(--eqx-surface)',
        marginLeft: i === 0 ? 0 : -6,
        zIndex: shown.length - i,
        position: 'relative'
      }}>
            {m.initials.charAt(0)}
          </div>;
    })}
      {overflow > 0 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border" style={{
      backgroundColor: 'var(--eqx-raised)',
      borderColor: 'var(--eqx-surface)',
      color: 'var(--eqx-tertiary)',
      marginLeft: -6,
      position: 'relative',
      zIndex: 0
    }}>
          +{overflow}
        </div>}
    </div>;
}