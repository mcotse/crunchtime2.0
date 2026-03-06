import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon } from 'lucide-react';
import { Member } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { EQX_EASING, formatEventDate } from './events/eventsConstants';
import { AvatarStack } from './EventAvatarStack';
import { EventOverflowMenu } from './EventOverflowMenu';
import { CoverIcon } from './coverIcons';
interface EventListItemProps {
  event: GroupEvent;
  members: Member[];
  currentUserId: string;
  index: number;
  onOpen: (ev: GroupEvent) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  muted?: boolean;
}
export function EventListItem({
  event: ev,
  members,
  currentUserId,
  index,
  onOpen,
  onArchive,
  onUnarchive,
  muted = false
}: EventListItemProps) {
  const myRsvp = ev.rsvps.find((r) => r.memberId === currentUserId);
  const goingIds = ev.rsvps.filter((r) => r.status === 'going').map((r) => r.memberId);
  const maybeCount = ev.rsvps.filter((r) => r.status === 'maybe').length;
  const myStatusColor = myRsvp?.status === 'going' ? 'var(--eqx-mint)' : myRsvp?.status === 'maybe' ? 'var(--eqx-orange)' : myRsvp?.status === 'not_going' ? 'var(--eqx-coral)' : 'var(--eqx-tertiary)';
  const myStatusLabel = myRsvp?.status === 'going' ? 'Going' : myRsvp?.status === 'maybe' ? 'Maybe' : myRsvp?.status === 'not_going' ? "Can't go" : 'RSVP';
  return <motion.div initial={{
    opacity: 0,
    y: 6
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.18,
    delay: index * 0.04,
    ease: EQX_EASING
  }} className="rounded-[24px] border overflow-hidden" style={{
    backgroundColor: 'var(--eqx-surface)',
    borderColor: 'var(--eqx-hairline)',
    opacity: muted ? 0.65 : 1
  }}>
      <button onClick={() => onOpen(ev)} className="w-full text-left px-5 pt-4 pb-3 active:opacity-[0.92]">
        <div className="flex items-start gap-3">
          <span className="leading-none flex-shrink-0 mt-0.5 flex items-center justify-center">
            <CoverIcon name={ev.coverEmoji} size={24} strokeWidth={1.5} style={{ color: 'var(--eqx-periwinkle)' }} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-[15px] leading-snug truncate flex-1" style={{
              color: 'var(--eqx-primary)'
            }}>
                {ev.title}
              </h4>
              <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{
              color: myStatusColor,
              borderColor: `color-mix(in srgb, ${myStatusColor} 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${myStatusColor} 7%, transparent)`
            }}>
                {myStatusLabel}
              </span>
            </div>
            {ev.dateStr && <p className="text-[12px] mt-1" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                {formatEventDate(ev.dateStr, ev.time)}
              </p>}
            {ev.location && <p className="text-[12px] mt-0.5 flex items-center gap-1" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                <MapPinIcon size={10} strokeWidth={1.5} />
                {ev.location}
              </p>}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{
      borderColor: 'var(--eqx-hairline)'
    }}>
        <div className="flex items-center gap-2.5">
          {goingIds.length > 0 && <AvatarStack memberIds={goingIds} members={members} max={5} />}
          <span className="text-[12px]" style={{
          color: 'var(--eqx-tertiary)'
        }}>
            {goingIds.length > 0 ? `${goingIds.length} going${maybeCount > 0 ? ` · ${maybeCount} maybe` : ''}` : maybeCount > 0 ? `${maybeCount} maybe` : 'No RSVPs yet'}
          </span>
        </div>
        <EventOverflowMenu event={ev} onArchive={onArchive} onUnarchive={onUnarchive} />
      </div>
    </motion.div>;
}