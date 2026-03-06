import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Member } from '../data/mockData';
import { CalendarAvailability, isPast } from '../data/calendarData';
import { GroupEvent } from '../data/eventsData';
import { CoverIcon } from './coverIcons';
interface DayDetailSheetProps {
  dateStr: string | null;
  isOpen: boolean;
  onClose: () => void;
  availability: CalendarAvailability;
  members: Member[];
  currentUserId: string;
  onToggle: (dateStr: string) => void;
  events?: GroupEvent[];
  onOpenEvent?: (event: GroupEvent) => void;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
export function DayDetailSheet({
  dateStr,
  isOpen,
  onClose,
  availability,
  members,
  currentUserId,
  onToggle,
  events = [],
  onOpenEvent
}: DayDetailSheetProps) {
  if (!dateStr) return null;
  const dayAvail = availability[dateStr] ?? {
    memberIds: []
  };
  const past = isPast(dateStr);
  const isAvailable = dayAvail.memberIds.includes(currentUserId);
  const dayEvents = events.filter((ev) => ev.dateStr === dateStr);
  const availableMembers = dayAvail.memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.6
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} onClick={onClose} className="fixed inset-0 z-50" style={{
        backgroundColor: '#000000'
      }} />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[51] max-h-[90vh] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0'
      }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-shrink-0">
              <div>
                <h2 className="font-semibold" style={{
              fontSize: '20px',
              lineHeight: '24px',
              color: 'var(--eqx-primary)'
            }}>
                  {formatDateLabel(dateStr)}
                </h2>
                {past && <span className="text-[13px] font-medium" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    Past date — view only
                  </span>}
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Events on this day */}
              {dayEvents.length > 0 && <div className="space-y-2">
                  <p className="text-[13px] font-medium uppercase tracking-widest" style={{
              color: 'var(--eqx-secondary)'
            }}>
                    Events
                  </p>
                  {dayEvents.map((ev) => {
              const myRsvp = ev.rsvps.find((r) => r.memberId === currentUserId);
              const myStatusColor = myRsvp?.status === 'going' ? 'var(--eqx-mint)' : myRsvp?.status === 'maybe' ? 'var(--eqx-orange)' : myRsvp?.status === 'not_going' ? 'var(--eqx-coral)' : 'var(--eqx-tertiary)';
              return <button key={ev.id} onClick={() => onOpenEvent?.(ev)} className="w-full flex items-center gap-3 rounded-[20px] border px-4 py-3.5 active:opacity-[0.92] text-left" style={{
                backgroundColor: 'var(--eqx-raised)',
                borderColor: 'var(--eqx-hairline)'
              }}>
                        <span className="leading-none flex-shrink-0 flex items-center justify-center">
                          <CoverIcon name={ev.coverEmoji} size={24} strokeWidth={1.5} style={{ color: 'var(--eqx-periwinkle)' }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold truncate" style={{
                    color: 'var(--eqx-primary)'
                  }}>
                            {ev.title}
                          </p>
                          <p className="text-[13px] mt-0.5" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            {ev.time ? formatTime(ev.time) : 'No time set'}
                            {ev.location ? ` · ${ev.location}` : ''}
                          </p>
                        </div>
                        <span className="text-[12px] font-semibold flex-shrink-0" style={{
                  color: myStatusColor
                }}>
                          {myRsvp?.status === 'going' ? 'Going' : myRsvp?.status === 'maybe' ? 'Maybe' : myRsvp?.status === 'not_going' ? "Can't" : 'RSVP'}
                        </span>
                      </button>;
            })}
                </div>}

              {/* Availability section */}
              <div className="rounded-[20px] border overflow-hidden" style={{
            borderColor: 'var(--eqx-hairline)'
          }}>
                {/* Toggle row */}
                <div className="flex items-center justify-between px-5 py-4" style={{
              backgroundColor: 'var(--eqx-raised)'
            }}>
                  <div>
                    <p className="text-[15px] font-semibold" style={{
                  color: 'var(--eqx-primary)'
                }}>
                      Available this day
                    </p>
                    <p className="text-[13px] mt-0.5" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                      {availableMembers.length}{' '}
                      {availableMembers.length === 1 ? 'person' : 'people'}{' '}
                      available
                    </p>
                  </div>

                  {!past ? <button type="button" onClick={() => onToggle(dateStr)} className="relative inline-flex h-7 w-12 items-center rounded-full active:opacity-[0.92]" style={{
                backgroundColor: isAvailable ? 'var(--eqx-orange)' : 'var(--eqx-hairline)'
              }} aria-label="Toggle availability">
                      <motion.span layout transition={{
                  duration: 0.12,
                  ease: EQX_EASING
                }} className="inline-block h-5 w-5 rounded-full shadow" style={{
                  backgroundColor: isAvailable ? 'var(--eqx-base)' : 'var(--eqx-tertiary)',
                  transform: isAvailable ? 'translateX(24px)' : 'translateX(4px)'
                }} />
                    </button> : <span className="text-[13px] font-medium" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      Past
                    </span>}
                </div>

                {/* Member chips — first 6 with +N overflow */}
                <div className="border-t px-5 py-4" style={{
              borderColor: 'var(--eqx-hairline)',
              backgroundColor: 'var(--eqx-surface)'
            }}>
                  {availableMembers.length > 0 ? <div className="flex flex-wrap gap-2">
                      {availableMembers.slice(0, 6).map((member) => <motion.div key={member.id} initial={{
                  opacity: 0,
                  scale: 0.85
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.85
                }} transition={{
                  duration: 0.12,
                  ease: EQX_EASING
                }} className="flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 border" style={{
                  backgroundColor: 'var(--eqx-raised)',
                  borderColor: 'var(--eqx-hairline)'
                }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{
                    backgroundColor: member.color
                  }}>
                            {member.initials.charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium" style={{
                    color: 'var(--eqx-secondary)'
                  }}>
                            {member.name.split(' ')[0]}
                          </span>
                        </motion.div>)}
                      {availableMembers.length > 6 && <div className="flex items-center rounded-full px-2.5 py-1 border" style={{
                  backgroundColor: 'var(--eqx-raised)',
                  borderColor: 'var(--eqx-hairline)'
                }}>
                          <span className="text-[13px] font-medium" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            +{availableMembers.length - 6} more
                          </span>
                        </div>}
                    </div> : <p className="text-[13px] text-center" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      No availability shared
                    </p>}
                </div>
              </div>

              {past && <div className="flex flex-col items-center py-4 text-center">
                  <p className="text-[14px]" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    Availability can't be edited for past dates
                  </p>
                </div>}
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}