import React from 'react';
import { motion } from 'framer-motion';
import { Member } from '../../data/mockData';
import { GroupEvent } from '../../data/eventsData';
import { EQX_EASING } from './eventsConstants';
import { CoverIcon } from '../coverIcons';
interface EventDateChipCardProps {
  event: GroupEvent;
  members: Member[];
  currentUserId: string;
  index: number;
  onOpen: (ev: GroupEvent) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onRsvp?: (eventId: string, rsvp: {
    status: 'going' | 'maybe' | 'not_going';
  }) => void;
}
export function EventDateChipCard({
  event: ev,
  members,
  currentUserId,
  index,
  onOpen,
  onArchive,
  onUnarchive,
  onRsvp
}: EventDateChipCardProps) {
  const myRsvp = ev.rsvps.find((r) => r.memberId === currentUserId);
  const goingCount = ev.rsvps.filter((r) => r.status === 'going').length;
  const maybeCount = ev.rsvps.filter((r) => r.status === 'maybe').length;
  let monthAbbr = '';
  let dayNum = '';
  if (ev.dateStr) {
    const d = new Date(ev.dateStr + 'T00:00:00');
    monthAbbr = d.toLocaleDateString('en-US', {
      month: 'short'
    }).toUpperCase();
    dayNum = String(d.getDate());
  }
  let timeLocation = '';
  if (ev.time) {
    const [h, m] = ev.time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    timeLocation = `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  if (ev.location) {
    timeLocation = timeLocation ? `${timeLocation} · ${ev.location}` : ev.location;
  }
  const rsvpSummary = goingCount > 0 ? `${goingCount} going${maybeCount > 0 ? ` · ${maybeCount} maybe` : ''}` : maybeCount > 0 ? `${maybeCount} maybe` : 'No RSVPs yet';
  const rsvpOptions: {
    status: 'going' | 'maybe' | 'not_going';
    label: string;
    selectedBg: string;
    selectedBorder: string;
    selectedText: string;
  }[] = [{
    status: 'going',
    label: 'Going',
    selectedBg: 'color-mix(in srgb, var(--eqx-mint) 15%, transparent)',
    selectedBorder: 'color-mix(in srgb, var(--eqx-mint) 40%, transparent)',
    selectedText: 'var(--eqx-mint)'
  }, {
    status: 'maybe',
    label: 'Maybe',
    selectedBg: 'color-mix(in srgb, var(--eqx-orange) 15%, transparent)',
    selectedBorder: 'color-mix(in srgb, var(--eqx-orange) 40%, transparent)',
    selectedText: 'var(--eqx-orange)'
  }, {
    status: 'not_going',
    label: "Can't go",
    selectedBg: 'color-mix(in srgb, var(--eqx-coral) 15%, transparent)',
    selectedBorder: 'color-mix(in srgb, var(--eqx-coral) 40%, transparent)',
    selectedText: 'var(--eqx-coral)'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 8
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.22,
    delay: index * 0.06,
    ease: EQX_EASING
  }} className="w-full rounded-[24px] border overflow-hidden" style={{
    backgroundColor: 'var(--eqx-surface)',
    borderColor: 'var(--eqx-hairline)'
  }}>
      <button onClick={() => onOpen(ev)} className="w-full text-left px-5 pt-5 pb-4 flex items-center gap-4 active:opacity-[0.92]">
        {ev.dateStr ? <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-[14px]" style={{
        width: 44,
        height: 52,
        backgroundColor: 'var(--eqx-raised)'
      }}>
            <span className="font-semibold uppercase leading-none" style={{
          fontSize: '10px',
          color: 'var(--eqx-tertiary)'
        }}>
              {monthAbbr}
            </span>
            <span className="font-bold leading-none mt-1" style={{
          fontSize: '22px',
          color: 'var(--eqx-primary)'
        }}>
              {dayNum}
            </span>
          </div> : <div className="flex-shrink-0 flex items-center justify-center rounded-[14px]" style={{
        width: 44,
        height: 52,
        backgroundColor: 'var(--eqx-raised)'
      }}>
            <CoverIcon name={ev.coverEmoji} size={22} strokeWidth={1.5} style={{ color: 'var(--eqx-periwinkle)' }} />
          </div>}
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-snug truncate" style={{
          fontSize: '16px',
          color: 'var(--eqx-primary)'
        }}>
            {ev.title}
          </p>
          {timeLocation && <p className="mt-1 truncate" style={{
          fontSize: '12px',
          color: 'var(--eqx-tertiary)'
        }}>
              {timeLocation}
            </p>}
          <p className="mt-1" style={{
          fontSize: '12px',
          color: 'var(--eqx-tertiary)'
        }}>
            {rsvpSummary}
          </p>
        </div>
      </button>
      <div className="flex gap-1.5 px-5 pb-5">
        {rsvpOptions.map((opt) => {
        const isSelected = myRsvp?.status === opt.status;
        return <button key={opt.status} onClick={(e) => {
          e.stopPropagation();
          onRsvp?.(ev.id, {
            status: opt.status
          });
        }} className="flex-1 rounded-full font-medium active:opacity-[0.88] transition-colors" style={{
          height: 32,
          fontSize: 12,
          backgroundColor: isSelected ? opt.selectedBg : 'transparent',
          border: `1px solid ${isSelected ? opt.selectedBorder : 'var(--eqx-hairline)'}`,
          color: isSelected ? opt.selectedText : 'var(--eqx-tertiary)'
        }}>
              {opt.label}
            </button>;
      })}
      </div>
    </motion.div>;
}