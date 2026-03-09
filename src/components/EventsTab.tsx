import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useWebHaptics } from 'web-haptics/react';
import { dateKey, today } from '../data/calendarData';
import { EQX_EASING } from './events/eventsConstants';
import { CalendarMode, EventsTabProps } from './events/eventsTypes';
import { UpcomingModeSection } from './events/UpcomingModeSection';
import { AvailabilityModeSection } from './events/AvailabilityModeSection';
import { PollsModeSection } from './events/PollsModeSection';
import { ChallengesModeSection } from './events/ChallengesModeSection';
const SEGMENTS: {
  id: CalendarMode;
  label: string;
}[] = [{
  id: 'availability',
  label: 'Schedule'
}, {
  id: 'upcoming',
  label: 'Events'
}, {
  id: 'polls',
  label: 'Polls'
}, {
  id: 'challenges',
  label: 'Challenges'
}];
export function EventsTab({
  availability,
  members,
  currentUserId,
  onDayTap,
  onToggleAvailability,
  events,
  transactions,
  onCreateEvent,
  onOpenEvent,
  onArchiveEvent,
  onUnarchiveEvent,
  onOpenNotifications,
  hasUnread = false,
  challenges = [],
  onOpenChallenge,
  onProposeChallenge,
  polls = [],
  onOpenPoll,
  onVote,
  onRsvp
}: EventsTabProps) {
  const haptic = useWebHaptics();
  const now = today();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [mode, setMode] = useState<CalendarMode>('upcoming');
  const todayKey = dateKey(now);
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  // Compute event lists
  const upcomingEvents = events.filter((ev) => !ev.isArchived && (!ev.dateStr || ev.dateStr >= todayKey)).sort((a, b) => {
    if (!a.dateStr && !b.dateStr) return 0;
    if (!a.dateStr) return 1;
    if (!b.dateStr) return -1;
    return a.dateStr.localeCompare(b.dateStr);
  });
  const pastEvents = events.filter((ev) => !ev.isArchived && ev.dateStr && ev.dateStr < todayKey).sort((a, b) => b.dateStr!.localeCompare(a.dateStr!));
  const archivedEvents = events.filter((ev) => ev.isArchived).sort((a, b) => (b.dateStr ?? '').localeCompare(a.dateStr ?? ''));
  return <div className="flex-1 flex flex-col pb-24" style={{
    backgroundColor: 'var(--eqx-base)'
  }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: 'var(--eqx-base)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
      {/* Title bar */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h2 className="font-semibold" style={{
        fontSize: '24px',
        lineHeight: '28px',
        color: 'var(--eqx-primary)'
      }}>
          Events
        </h2>
        {mode === 'upcoming' && <motion.button initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} transition={{
        duration: 0.15,
        ease: EQX_EASING
      }} onClick={onCreateEvent} className="flex items-center gap-1.5 rounded-full px-3 font-semibold active:opacity-[0.88]" style={{
        height: 36,
        fontSize: 13,
        backgroundColor: 'transparent',
        border: '1px solid var(--eqx-hairline)',
        color: 'var(--eqx-primary)'
      }}>
            <PlusIcon size={13} strokeWidth={2.5} />
            New Event
          </motion.button>}
        {mode === 'polls' && <motion.button initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} transition={{
        duration: 0.15,
        ease: EQX_EASING
      }} onClick={onProposeChallenge} className="flex items-center gap-1.5 rounded-full px-3 font-semibold active:opacity-[0.88]" style={{
        height: 36,
        fontSize: 13,
        backgroundColor: 'transparent',
        border: '1px solid var(--eqx-hairline)',
        color: 'var(--eqx-primary)'
      }}>
            <PlusIcon size={13} strokeWidth={2.5} />
            New Poll
          </motion.button>}
      </div>

      {/* 4-segment control */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex p-1 rounded-full" style={{
        backgroundColor: 'var(--eqx-segment-track)'
      }}>
          {SEGMENTS.map((seg) => {
          const isActive = mode === seg.id;
          return <button key={seg.id} onClick={() => {
            haptic.trigger('selection');
            setMode(seg.id);
          }} className="flex-1 py-2 rounded-full text-[13px] font-semibold transition-colors active:opacity-[0.92]" style={{
            backgroundColor: isActive ? 'var(--eqx-segment-active)' : 'transparent',
            color: isActive ? 'var(--eqx-segment-text)' : 'var(--eqx-tertiary)'
          }}>
                {seg.label}
              </button>;
        })}
        </div>
      </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'upcoming' && <UpcomingModeSection upcomingEvents={upcomingEvents} pastEvents={pastEvents} archivedEvents={archivedEvents} members={members} currentUserId={currentUserId} onOpenEvent={onOpenEvent} onArchiveEvent={onArchiveEvent} onUnarchiveEvent={onUnarchiveEvent} onRsvp={onRsvp} />}

        {mode === 'availability' && <AvailabilityModeSection availability={availability} members={members} currentUserId={currentUserId} viewYear={viewYear} viewMonth={viewMonth} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} onToggleAvailability={onToggleAvailability} onDayTap={onDayTap} onCreateEvent={onCreateEvent} />}

        {mode === 'polls' && <PollsModeSection polls={polls} members={members} currentUserId={currentUserId} onOpenPoll={onOpenPoll} onVote={onVote} />}

        {mode === 'challenges' && <ChallengesModeSection challenges={challenges} members={members} transactions={transactions} currentUserId={currentUserId} onOpenChallenge={onOpenChallenge} />}
      </AnimatePresence>
    </div>;
}