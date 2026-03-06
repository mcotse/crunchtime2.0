import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { Member } from '../../data/mockData';
import { GroupEvent } from '../../data/eventsData';
import { EQX_EASING } from './eventsConstants';
import { EventDateChipCard } from './EventDateChipCard';
import { EventListItem } from './EventListItem';
interface UpcomingModeSectionProps {
  upcomingEvents: GroupEvent[];
  pastEvents: GroupEvent[];
  archivedEvents: GroupEvent[];
  members: Member[];
  currentUserId: string;
  onOpenEvent: (event: GroupEvent) => void;
  onArchiveEvent: (eventId: string) => void;
  onUnarchiveEvent: (eventId: string) => void;
  onRsvp?: (eventId: string, rsvp: {
    status: 'going' | 'maybe' | 'not_going';
  }) => void;
}
export function UpcomingModeSection({
  upcomingEvents,
  pastEvents,
  archivedEvents,
  members,
  currentUserId,
  onOpenEvent,
  onArchiveEvent,
  onUnarchiveEvent,
  onRsvp
}: UpcomingModeSectionProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyCount = pastEvents.length + archivedEvents.length;
  return <motion.div key="upcoming" initial={{
    opacity: 0,
    x: -8
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -8
  }} transition={{
    duration: 0.2,
    ease: EQX_EASING
  }} className="flex-1 flex flex-col">
      <div className="flex-1 px-4">
        {upcomingEvents.length === 0 ? <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-[24px] flex items-center justify-center" style={{
          backgroundColor: 'var(--eqx-raised)'
        }}>
              <CalendarIcon size={20} style={{
            color: 'var(--eqx-tertiary)'
          }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[15px] font-medium" style={{
            color: 'var(--eqx-secondary)'
          }}>
                Nothing planned yet
              </p>
              <p className="text-[13px]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                Create an event
              </p>
            </div>
          </div> : <div className="space-y-3">
            {upcomingEvents.map((ev, i) => <EventDateChipCard key={ev.id} event={ev} members={members} currentUserId={currentUserId} index={i} onOpen={onOpenEvent} onArchive={onArchiveEvent} onUnarchive={onUnarchiveEvent} onRsvp={onRsvp} />)}
          </div>}

        {historyCount > 0 && <div className="mt-6">
            <button onClick={() => setHistoryOpen((v) => !v)} className="w-full flex items-center justify-between py-3 active:opacity-[0.92]" aria-expanded={historyOpen}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold" style={{
              color: 'var(--eqx-secondary)'
            }}>
                  History
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
              backgroundColor: 'var(--eqx-raised)',
              color: 'var(--eqx-tertiary)'
            }}>
                  {historyCount}
                </span>
              </div>
              {historyOpen ? <ChevronUpIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} /> : <ChevronDownIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} />}
            </button>

            <AnimatePresence>
              {historyOpen && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.28,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                  <div className="space-y-5 pb-4">
                    {pastEvents.length > 0 && <div className="space-y-2.5">
                        
                        {pastEvents.map((ev, i) => <EventListItem key={ev.id} event={ev} members={members} currentUserId={currentUserId} index={i} onOpen={onOpenEvent} onArchive={onArchiveEvent} onUnarchive={onUnarchiveEvent} muted />)}
                      </div>}
                    {archivedEvents.length > 0 && <div className="space-y-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                          Archived
                        </p>
                        {archivedEvents.map((ev, i) => <EventListItem key={ev.id} event={ev} members={members} currentUserId={currentUserId} index={i} onOpen={onOpenEvent} onArchive={onArchiveEvent} onUnarchive={onUnarchiveEvent} muted />)}
                      </div>}
                  </div>
                </motion.div>}
            </AnimatePresence>

            {!historyOpen && <div className="border-t" style={{
          borderColor: 'var(--eqx-hairline)'
        }} />}
          </div>}
      </div>
    </motion.div>;
}